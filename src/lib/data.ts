import { getDb } from "./db";
import { calculateDeal, type AssumptionsInput, type ProjectInput } from "./calculations";
import {
  defaultAssumptions,
  ericaDriveCostItems,
  ericaDriveProject,
  ericaDriveStarterItemNames,
} from "./seed-data";

export async function getAssumptions() {
  const db = getDb();
  const existing = await db.assumption.findFirst({ orderBy: { updatedAt: "desc" } });

  if (existing) return existing;

  return db.assumption.create({ data: defaultAssumptions });
}

export async function getProjects() {
  const db = getDb();
  let projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { costItems: { orderBy: [{ purchased: "asc" }, { createdAt: "desc" }] } },
  });

  const ericaProject = projects.find((project) => project.name === ericaDriveProject.name);
  const needsEricaSeed =
    !ericaProject || !ericaProject.costItems.some((item) => item.name === ericaDriveCostItems[0].name);

  if (needsEricaSeed) {
    await seedStarterProject();
    projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { costItems: { orderBy: [{ purchased: "asc" }, { createdAt: "desc" }] } },
    });
  }

  return projects;
}

export async function getProject(id: string) {
  return getDb().project.findUnique({
    where: { id },
    include: { costItems: { orderBy: [{ purchased: "asc" }, { createdAt: "desc" }] } },
  });
}

export async function getCalculatedProjects() {
  const [assumptions, projects] = await Promise.all([getAssumptions(), getProjects()]);

  return projects.map((project) => ({
    project,
    calculation: calculateDeal(project as ProjectInput, assumptions as AssumptionsInput),
  }));
}

export async function getCalculatedProject(id: string) {
  const [assumptions, project] = await Promise.all([getAssumptions(), getProject(id)]);
  if (!project) return null;

  return {
    project,
    assumptions,
    calculation: calculateDeal(project as ProjectInput, assumptions as AssumptionsInput),
  };
}

async function seedStarterProject() {
  const db = getDb();
  const existingProject = await db.project.findFirst({
    where: { name: ericaDriveProject.name },
  });

  if (existingProject) {
    await ensureEricaDriveCostItems(existingProject.id);
    return;
  }

  const project = await db.project.create({
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

  await ensureEricaDriveCostItems(project.id);
}

async function ensureEricaDriveCostItems(projectId: string) {
  const db = getDb();
  const existingItems = await db.renovationCostItem.findMany({
    where: { projectId },
    select: { name: true },
  });
  const existingNames = new Set(existingItems.map((item) => item.name));

  if (existingNames.has(ericaDriveCostItems[0].name)) return;

  await db.renovationCostItem.deleteMany({
    where: {
      projectId,
      name: { in: ericaDriveStarterItemNames },
    },
  });

  await db.renovationCostItem.createMany({
    data: ericaDriveCostItems.map((item) => ({
      ...item,
      projectId,
    })),
  });
}
