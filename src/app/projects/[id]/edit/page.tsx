import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateProjectAction } from "@/app/actions";
import { PageHeader } from "@/components/ui";
import { getProject } from "@/lib/data";
import { EditProjectForm } from "./EditProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <Link href={`/projects/${project.id}`} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-800">
        <ArrowLeft size={16} />
        {project.name}
      </Link>
      <PageHeader eyebrow="Edit project" title={project.name} />
      <EditProjectForm action={updateProjectAction} project={project} />
    </>
  );
}
