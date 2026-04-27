import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import prisma from '@/lib/prisma';
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
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await prisma.userRole.count({
      where: {
        userId: user.id,
        role: 'admin',
      },
    });

    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        profile: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error('admin orders error', error);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
