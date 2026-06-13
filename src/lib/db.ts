import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Always cache on globalThis — prevents multiple engine instances on
// constrained hosts (Hostinger) where module re-evaluation causes new
// PrismaClient processes to spawn and panic with "timer has gone away".
globalForPrisma.prisma = db;
