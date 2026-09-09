import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Re-export everything from @prisma/client (types, enums, etc.)
export * from "@prisma/client";

// Re-export the PrismaClient constructor explicitly.
// In Prisma 5.x the generated client exports PrismaClient as a class,
// but `export *` does not re-export default or class members reliably
// across all TS module resolution modes, so we add a named re-export.
export { PrismaClient } from "@prisma/client";
