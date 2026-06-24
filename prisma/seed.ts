import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { calculateDeal } from "../src/lib/calculations";
import { defaultAssumptions, ericaDriveCostItems, ericaDriveProject } from "../src/lib/seed-data";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.renovationCostItem.deleteMany();
  await prisma.projectSnapshot.deleteMany();
  await prisma.project.deleteMany();
  await prisma.assumption.deleteMany();

  const assumption = await prisma.assumption.create({
    data: defaultAssumptions,
  });

  const project = await prisma.project.create({
    data: {
      ...ericaDriveProject,
      plumbingLevel: ericaDriveProject.plumbingLevel ?? "NONE",
      electricalLevel: ericaDriveProject.electricalLevel ?? "NONE",
      decoratingLevel: ericaDriveProject.decoratingLevel ?? "NONE",
      plasteringLevel: ericaDriveProject.plasteringLevel ?? "NONE",
      notes:
        "Seeded from the Erica Drive finance sheet and floor plan. Floor-plan approximate total area: 915 sq ft.",
      costItems: {
        create: ericaDriveCostItems,
      },
    },
  });

  const result = calculateDeal(project, assumption);

  await prisma.projectSnapshot.create({
    data: {
      projectId: project.id,
      acquisitionCosts: result.acquisition,
      renovationCosts: result.renovation,
      holdingCosts: result.holding,
      disposalCosts: result.disposal,
      results: result.metrics,
      sensitivity: result.sensitivity,
      warnings: result.warnings,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
