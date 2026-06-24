"use client";

import { useRef, useTransition } from "react";
import { updateRenovationCostItemStatusAction } from "@/app/actions";

export function PurchasedStatusForm({
  itemId,
  itemName,
  projectId,
  purchased,
}: {
  itemId: string;
  itemName: string;
  projectId: string;
  purchased: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form ref={formRef} action={updateRenovationCostItemStatusAction} className="flex items-center gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="itemId" value={itemId} />
      <input
        aria-label={`Mark ${itemName} as purchased`}
        className="size-4 accent-sky-500"
        defaultChecked={purchased}
        disabled={isPending}
        name="purchased"
        onChange={() => {
          startTransition(() => formRef.current?.requestSubmit());
        }}
        type="checkbox"
      />
      <button
        className="rounded-md border border-slate-700 px-2 py-1 text-xs font-medium text-slate-300 hover:border-sky-400 hover:text-sky-200 disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "Updating..." : purchased ? "Purchased" : "Planned"}
      </button>
    </form>
  );
}
