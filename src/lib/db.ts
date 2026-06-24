import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

let prisma: PrismaClient | null = null;

export function getDb() {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required. Connect a Postgres database before running the app.");
    }

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
