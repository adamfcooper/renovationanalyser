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
  return getDb().project.findMany({
    orderBy: { createdAt: "desc" },
    include: { costItems: { orderBy: [{ purchased: "asc" }, { createdAt: "desc" }] } },
  });
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
