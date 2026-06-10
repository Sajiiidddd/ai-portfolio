// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ── Production cold-start upgrade (optional, recommended) ─────────────────
// The schema already has previewFeatures = ["driverAdapters"]. To cut
// serverless connect latency on Vercel + Neon, run ON YOUR MACHINE:
//   npm i @prisma/adapter-neon @neondatabase/serverless
// then replace the client below with:
//   import { PrismaNeon } from '@prisma/adapter-neon';
//   import { Pool } from '@neondatabase/serverless';
//   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
//   const adapter = new PrismaNeon(pool);
//   new PrismaClient({ adapter })
// ───────────────────────────────────────────────────────────────────────────
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
