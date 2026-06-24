import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

let prisma: PrismaClient | null = null;

export function getDb() {
  if (!prisma) {
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./dev.db",
    });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
