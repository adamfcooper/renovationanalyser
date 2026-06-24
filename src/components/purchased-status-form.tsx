"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticPurchased, setOptimisticPurchased] = useOptimistic(purchased);

  function updateStatus(nextPurchased: boolean) {
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("itemId", itemId);
    formData.set("status", nextPurchased ? "purchased" : "planned");

    startTransition(() => {
      setOptimisticPurchased(nextPurchased);
      updateRenovationCostItemStatusAction(formData).then(() => {
        router.refresh();
      });
    });
  }

  return (
    <div aria-label={`Set purchase status for ${itemName}`} className="inline-grid grid-cols-2 rounded-md border border-slate-700 bg-[#111318] p-1">
      <button
        className={`h-8 rounded px-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
          optimisticPurchased ? "text-slate-400 hover:text-white" : "bg-amber-400 text-slate-950"
        }`}
        disabled={isPending}
        onClick={() => updateStatus(false)}
        type="button"
      >
        Planned
      </button>
      <button
        className={`h-8 rounded px-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
          optimisticPurchased ? "bg-emerald-400 text-slate-950" : "text-slate-400 hover:text-white"
        }`}
        disabled={isPending}
        onClick={() => updateStatus(true)}
        type="button"
      >
        Purchased
      </button>
    </div>
  );
}
