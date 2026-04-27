import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Minus, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import type { Tables } from "@/integrations/supabase/types";

type InventoryFormState = {
  sku_id: string;
  part_name: string | null;
  category_id: number;
  model_id: number | null;
  quality_grade: Tables<"inventory">["quality_grade"];
  specifications: string | null;
  wholesale_price: number | null;
  moq: number;
  stock_level: number;
  image_url: string | null;
};

type CategoryRow = Pick<Tables<"categories">, "id" | "name">;
type ModelRow = Pick<Tables<"models">, "id" | "marketing_name" | "generation"> & {
  brands: Pick<Tables<"brands">, "name"> | null;
};
type InventoryRow = Tables<"inventory"> & {
  categories: Pick<Tables<"categories">, "name"> | null;
  models: ModelRow | null;
};

const emptyForm: InventoryFormState = {
  sku_id: "",
  part_name: "",
  category_id: 0,
  model_id: null,
  quality_grade: "Aftermarket",
  specifications: "",
  wholesale_price: 0,
  moq: 1,
  stock_level: 0,
  image_url: "",
};

export const AdminInventory = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryRow | null>(null);
  const [form, setForm] = useState<InventoryFormState>(emptyForm);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("inventory")
        .select("*, categories(name), models(marketing_name, brands(name))")
        .order("sku_id");
      if (error) throw error;
      return (data ?? []) as InventoryRow[];
    },
    // Only fetch on the client — server-side prerender can use a server-safe API later
    enabled: typeof window !== 'undefined',
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as CategoryRow[];
    },
    enabled: typeof window !== 'undefined',
  });

  const { data: models } = useQuery({
    queryKey: ["admin-models"],
    queryFn: async () => {
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("models")
        .select("id, marketing_name, generation, brands(name)")
        .order("marketing_name");
      if (error) throw error;
      return (data ?? []) as ModelRow[];
    },
    enabled: typeof window !== 'undefined',
  });

  const upsertMutation = useMutation({
    mutationFn: async (row: InventoryRow) => {
      const payload = {
        sku_id: row.sku_id,
        part_name: row.part_name || null,
        category_id: row.category_id,
        model_id: row.model_id,
        quality_grade: row.quality_grade,
        specifications: row.specifications || null,
        wholesale_price: row.wholesale_price,
        moq: row.moq,
        stock_level: row.stock_level,
        image_url: row.image_url || null,
      };
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const { error } = await supabase.from("inventory").upsert(payload);
      if (error) throw error;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      qc.invalidateQueries({ queryKey: ["catalog"] });
      toast.success(editing ? "SKU updated" : "SKU created");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const stockMutation = useMutation({
    mutationFn: async ({ sku_id, delta }: { sku_id: string; delta: number }) => {
      const current = inventory?.find((i) => i.sku_id === sku_id);
      if (!current) throw new Error("SKU not found");
      const newLevel = Math.max(0, current.stock_level + delta);
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const { error } = await supabase
        .from("inventory")
        .update({ stock_level: newLevel })
        .eq("sku_id", sku_id);
      if (error) throw error;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      qc.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      category_id: categories?.[0]?.id ?? 0,
      model_id: models?.[0]?.id ?? null,
    });
    setOpen(true);
  };

  const openEdit = (row: InventoryRow) => {
    setEditing(row);
    setForm({
      sku_id: row.sku_id,
      part_name: row.part_name ?? "",
      category_id: row.category_id,
      model_id: row.model_id,
      quality_grade: row.quality_grade ?? "Aftermarket",
      specifications: row.specifications ?? "",
      wholesale_price: row.wholesale_price ?? 0,
      moq: row.moq,
      stock_level: row.stock_level,
      image_url: row.image_url ?? "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {inventory?.length ?? 0} SKUs · adjust stock or edit details
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <PackagePlus className="mr-2 h-4 w-4" /> Add SKU
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? `Edit ${editing.sku_id}` : "Add new SKU"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU ID</Label>
                  <Input
                    id="sku"
                    value={form.sku_id}
                    disabled={!!editing}
                    onChange={(e) => setForm({ ...form, sku_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="part">Part name</Label>
                  <Input
                    id="part"
                    value={form.part_name ?? ""}
                    onChange={(e) => setForm({ ...form, part_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={String(form.category_id)}
                    onValueChange={(v) => setForm({ ...form, category_id: Number(v) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Select
                    value={form.model_id ? String(form.model_id) : ""}
                    onValueChange={(v) => setForm({ ...form, model_id: Number(v) })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      {models?.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.brands?.name} {m.marketing_name} {m.generation ? `(${m.generation})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Quality grade</Label>
                  <Select
                    value={form.quality_grade ?? "Aftermarket"}
                    onValueChange={(v) =>
                      setForm({ ...form, quality_grade: v as InventoryFormState["quality_grade"] })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OEM">OEM</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Wholesale price (¢)</Label>
                  <Input
                    id="price" type="number" min={0}
                    value={form.wholesale_price ?? 0}
                    onChange={(e) => setForm({ ...form, wholesale_price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="moq">MOQ</Label>
                  <Input
                    id="moq" type="number" min={1}
                    value={form.moq}
                    onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stock level</Label>
                  <Input
                    id="stock" type="number" min={0}
                    value={form.stock_level}
                    onChange={(e) => setForm({ ...form, stock_level: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="img">Image URL</Label>
                  <Input
                    id="img"
                    placeholder="/F8B48E10-46F9-4474-A98F-191D370F222D.png"
                    value={form.image_url ?? ""}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>
              </div>
              {form.image_url && (
                <div>
                  <Label>Image preview</Label>
                  <div className="mt-2 overflow-hidden rounded-xl border border-border bg-background">
                    <img
                      src={form.image_url}
                      alt={form.part_name ?? "SKU image preview"}
                      className="h-32 w-full object-contain"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="specs">Specifications</Label>
                <Textarea
                  id="specs" rows={3}
                  value={form.specifications ?? ""}
                  onChange={(e) => setForm({ ...form, specifications: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => upsertMutation.mutate(form)}
                disabled={!form.sku_id || !form.category_id || upsertMutation.isPending}
              >
                {editing ? "Save changes" : "Create SKU"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Part</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {inventory?.map((row) => (
              <TableRow key={row.sku_id}>
                <TableCell className="font-mono text-xs">{row.sku_id}</TableCell>
                <TableCell>{row.part_name ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.models?.brands?.name} {row.models?.marketing_name}
                </TableCell>
                <TableCell>
                  {row.quality_grade && <Badge variant="secondary">{row.quality_grade}</Badge>}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {row.wholesale_price ? `$${(row.wholesale_price / 100).toFixed(2)}` : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="icon" variant="outline" className="h-7 w-7"
                      onClick={() => stockMutation.mutate({ sku_id: row.sku_id, delta: -1 })}
                      disabled={row.stock_level <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center font-mono text-sm">{row.stock_level}</span>
                    <Button
                      size="icon" variant="outline" className="h-7 w-7"
                      onClick={() => stockMutation.mutate({ sku_id: row.sku_id, delta: 1 })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
