import { getDb } from "./db";
import { calculateDeal, type AssumptionsInput, type ProjectInput } from "./calculations";
import {
  defaultAssumptions,
  ericaDriveCostItems,
  ericaDriveProject,
  ericaDriveStarterItemNames,
} from "./seed-data";

const ERICA_PURCHASED_SEED_VERSION = "erica-cost-items-purchased-v1";
const ERICA_PURCHASED_SEED_MARKER = `[seed:${ERICA_PURCHASED_SEED_VERSION}]`;

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
  const importedItemNames = new Set(ericaDriveCostItems.map((item) => item.name));
  const importedItems = ericaProject?.costItems.filter((item) => importedItemNames.has(item.name)) ?? [];
  const needsEricaSeed =
    !ericaProject ||
    !ericaProject.costItems.some((item) => item.name === ericaDriveCostItems[0].name) ||
    (!ericaProject.notes?.includes(ERICA_PURCHASED_SEED_MARKER) && importedItems.some((item) => !item.purchased));

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
      notes: ericaSeedNotes(),
      costItems: {
        create: ericaDriveCostItems,
      },
    },
  });

  await ensureEricaDriveCostItems(project.id);
}

async function ensureEricaDriveCostItems(projectId: string) {
  const db = getDb();
  const importedItemNames = ericaDriveCostItems.map((item) => item.name);
  const existingItems = await db.renovationCostItem.findMany({
    where: { projectId },
    select: { name: true, purchased: true },
  });
  const existingNames = new Set(existingItems.map((item) => item.name));

  if (existingNames.has(ericaDriveCostItems[0].name)) {
    await db.renovationCostItem.updateMany({
      where: {
        projectId,
        name: { in: importedItemNames },
      },
      data: {
        purchased: true,
        purchasedAt: new Date(),
      },
    });
    await db.project.update({
      where: { id: projectId },
      data: { notes: existingProjectNotesWithMarker(await getProjectNotes(projectId)) },
    });
    return;
  }

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
      purchasedAt: item.purchased ? new Date() : null,
    })),
  });
}

async function getProjectNotes(projectId: string) {
  const project = await getDb().project.findUnique({
    where: { id: projectId },
    select: { notes: true },
  });

  return project?.notes ?? null;
}

function ericaSeedNotes() {
  return `Seeded from the Erica Drive finance sheet and floor plan. Floor-plan approximate total area: 915 sq ft.\n${ERICA_PURCHASED_SEED_MARKER}`;
}

function existingProjectNotesWithMarker(notes: string | null) {
  if (notes?.includes(ERICA_PURCHASED_SEED_MARKER)) return notes;
  return `${notes?.trim() || "Seeded from the Erica Drive finance sheet and floor plan. Floor-plan approximate total area: 915 sq ft."}\n${ERICA_PURCHASED_SEED_MARKER}`;
}
