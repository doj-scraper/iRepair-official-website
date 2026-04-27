import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CartItem = {
  skuId: string;
  quantity: number;
};

type InventoryRow = {
  sku_id: string;
  part_name: string | null;
  wholesale_price: number | null;
  stock_level: number;
  moq: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const { items } = (await req.json()) as { items: CartItem[] };
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Cart is empty");
    }
    if (items.some((item) => !item.skuId || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      throw new Error("Invalid cart items");
    }

    const uniqueSkuIds = [...new Set(items.map((item) => item.skuId))];
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: inventoryRows, error: inventoryErr } = await supabaseAdmin
      .from("inventory")
      .select("sku_id, part_name, wholesale_price, stock_level, moq")
      .in("sku_id", uniqueSkuIds);
    if (inventoryErr) throw inventoryErr;
    if (!inventoryRows || inventoryRows.length !== uniqueSkuIds.length) {
      const found = new Set((inventoryRows ?? []).map((row) => row.sku_id));
      const missing = uniqueSkuIds.filter((skuId) => !found.has(skuId));
      throw new Error(`Unknown SKU(s): ${missing.join(", ")}`);
    }

    const inventoryBySku = new Map(
      (inventoryRows as InventoryRow[]).map((row) => [row.sku_id, row])
    );
    for (const item of items) {
      const inventoryRow = inventoryBySku.get(item.skuId);
      if (!inventoryRow) throw new Error(`Unknown SKU: ${item.skuId}`);
      if (inventoryRow.wholesale_price == null) throw new Error(`Missing price for ${item.skuId}`);
      if (item.quantity < inventoryRow.moq) {
        throw new Error(`Minimum order quantity not met for ${item.skuId}`);
      }
      if (item.quantity > inventoryRow.stock_level) {
        throw new Error(`Insufficient stock for ${item.skuId}`);
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    // Reuse customer if exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const pricedItems = items.map((item) => {
      const inventoryRow = inventoryBySku.get(item.skuId)!;
      return {
        ...item,
        name: inventoryRow.part_name ?? inventoryRow.sku_id,
        price: inventoryRow.wholesale_price!,
      };
    });

    const total = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({ user_id: user.id, total_amount: total, status: "PENDING" })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(
      pricedItems.map((i) => ({
        order_id: order.id,
        sku_id: i.skuId,
        quantity: i.quantity,
        unit_price: i.price,
      }))
    );
    if (itemsErr) throw itemsErr;

    const origin = req.headers.get("origin") ?? "";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: pricedItems.map((i) => ({
        price_data: {
          currency: "usd",
          product_data: { name: i.name, metadata: { sku: i.skuId } },
          unit_amount: i.price,
        },
        quantity: i.quantity,
      })),
      mode: "payment",
      success_url: `${origin}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/catalog`,
      metadata: { order_id: order.id, user_id: user.id },
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("create-checkout error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
