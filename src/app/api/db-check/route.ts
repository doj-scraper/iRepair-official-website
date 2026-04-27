import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    try {
      const verification = await checkBotId();
      if (verification?.isBot) {
        return NextResponse.json({ ok: false, error: 'Access denied (bot detected)' }, { status: 403 });
      }
    } catch (err) {
      console.warn('BotID check failed (allowing request in dev):', err);
    }

    const [profiles, admins] = await Promise.all([
      prisma.profile.count(),
      prisma.userRole.count({ where: { role: 'admin' } }),
    ]);
    return NextResponse.json({ ok: true, profiles, admins });
  } catch (error) {
    console.error('DB check error', error);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
