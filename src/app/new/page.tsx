import { createProjectAction } from "@/app/actions";
import { PageHeader } from "@/components/ui";
import { NewDealForm } from "./NewDealForm";

export default function NewDealPage() {
  return (
    <>
      <PageHeader eyebrow="New Deal Questionnaire" title="Analyse a renovation opportunity" />
      <NewDealForm action={createProjectAction} />
    </>
  );
}
