import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getUserFromAuthHeader } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
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
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error('auth-me error', error);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
