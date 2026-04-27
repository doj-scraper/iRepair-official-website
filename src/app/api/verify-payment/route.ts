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
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'sessionId is required' }, { status: 400 });
    }

    const authorization = req.headers.get('authorization') ?? '';
    const { data, error } = await supabaseAdmin.functions.invoke('verify-payment', {
      body: { sessionId },
      headers: authorization ? { Authorization: authorization } : undefined,
    });

    if (error) {
      console.error('verify-payment (edge) error', error);
      return NextResponse.json({ ok: false, error: error.message ?? 'Verify payment failed' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('verify-payment handler error', err);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
