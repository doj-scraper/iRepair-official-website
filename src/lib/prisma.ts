import 'server-only';
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const connectionUrl =
  process.env.DATABASE_URL_DIRECT ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error('DATABASE_URL, DATABASE_URL_DIRECT, or DIRECT_URL is required');
}

const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

export default prisma;
