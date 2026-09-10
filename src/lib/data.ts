import { getDb } from "./db";
import { calculateDeal, type AssumptionsInput, type ProjectInput } from "./calculations";
import { defaultAssumptions } from "./seed-data";

export async function getAssumptions() {
  const db = getDb();
  const existing = await db.assumption.findFirst({ orderBy: { updatedAt: "desc" } });

  if (existing) return existing;

  return db.assumption.create({ data: defaultAssumptions });
}

export async function getProjects() {
  const db = getDb();
  await ensureMiscTags();

  return db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { costItems: { orderBy: [{ purchased: "asc" }, { createdAt: "desc" }] } },
  });
}

export async function getProject(id: string) {
  const db = getDb();
  await ensureMiscTags();

  return db.project.findUnique({
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

async function ensureMiscTags() {
  const db = getDb();

  await db.renovationCostItem.updateMany({
    where: {
      OR: [
        { name: { contains: "carpet", mode: "insensitive" } },
        { name: { contains: "floor", mode: "insensitive" } },
        { name: { contains: "flooring", mode: "insensitive" } },
        { name: { contains: "floorboards", mode: "insensitive" } },
      ],
    },
    data: { tag: "Flooring" },
  });

  await db.renovationCostItem.updateMany({
    where: {
      tag: {
        in: ["Bedroom", "Exterior", "General", "Hallway", "Living room", "Rest of house", "Utility / workshop", "Whole house"],
      },
    },
    data: { tag: "Misc" },
  });
}
