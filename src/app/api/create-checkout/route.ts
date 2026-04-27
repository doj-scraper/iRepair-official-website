import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import supabaseAdmin, { getUserFromAuthHeader } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    try {
      const verification = await checkBotId();
      if (verification?.isBot) {
        return NextResponse.json({ ok: false, error: 'Access denied (bot detected)' }, { status: 403 });
      }
    } catch (err) {
      console.warn('BotID check failed (allowing request in dev):', err);
    }

    const user = await getUserFromAuthHeader(req.headers.get('authorization'));
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthenticated' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { items } = body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'No items provided' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.functions.invoke('create-checkout', {
      body: { items, userId: user.id },
    });

    if (error) {
      console.error('create-checkout (edge) error', error);
      return NextResponse.json({ ok: false, error: error.message ?? 'Checkout failed' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('create-checkout handler error', err);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
