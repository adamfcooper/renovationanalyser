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
    <div aria-label={`Set purchase status for ${itemName}`} className="inline-grid grid-cols-2 rounded-md border border-neutral-300 bg-white p-1">
      <button
        className={`h-8 rounded px-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
          optimisticPurchased ? "text-neutral-500 hover:text-neutral-950" : "bg-amber-100 text-amber-900"
        }`}
        disabled={isPending}
        onClick={() => updateStatus(false)}
        type="button"
      >
        Planned
      </button>
      <button
        className={`h-8 rounded px-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
          optimisticPurchased ? "bg-emerald-100 text-emerald-900" : "text-neutral-500 hover:text-neutral-950"
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
