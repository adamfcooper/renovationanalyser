import { getDb } from "./db";
import { calculateDeal, type AssumptionsInput, type ProjectInput } from "./calculations";
import { defaultAssumptions, ericaDriveCostItems, ericaDriveProject } from "./seed-data";

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

  if (!projects.some((project) => project.name === ericaDriveProject.name)) {
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

  if (existingProject) return;

  await db.project.create({
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
}
