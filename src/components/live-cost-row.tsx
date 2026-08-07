"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteRenovationCostItemAction, updateRenovationCostItemAction } from "@/app/actions";
import { costSectionOptions } from "@/lib/cost-sections";
import { formatCurrency } from "@/lib/format";
import { liveCostGroupForTag } from "@/lib/tags";
import { PurchasedStatusForm } from "./purchased-status-form";

export type LiveCostRowItem = {
  id: string;
  amount: number;
  name: string;
  notes: string | null;
  purchaseUrl: string | null;
  purchased: boolean;
  supplier: string | null;
  tag: string | null;
};

export function LiveCostRow({ item, projectId }: { item: LiveCostRowItem; projectId: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentSection = liveCostGroupForTag(item.tag, item.name);

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    await updateRenovationCostItemAction(formData);
    setIsEditing(false);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <>
      <tr className="border-b border-neutral-200 last:border-0">
        <td className="px-4 py-3">
          <span className="font-medium text-neutral-950">{item.name}</span>
          {item.notes ? <span className="mt-1 block text-xs text-neutral-500">{item.notes}</span> : null}
        </td>
        <td className="px-4 py-3 text-neutral-700">{currentSection}</td>
        <td className="px-4 py-3 text-neutral-700">
          {item.purchaseUrl ? (
            <a
              className="inline-flex items-center gap-1 font-medium text-neutral-950 hover:text-neutral-700"
              href={item.purchaseUrl}
              rel="noreferrer"
              target="_blank"
            >
              {item.supplier || "Link"}
              <ExternalLink size={14} />
            </a>
          ) : (
            item.supplier || "n/a"
          )}
        </td>
        <td className="px-4 py-3 text-right font-medium text-neutral-950">{formatCurrency(item.amount)}</td>
        <td className="px-4 py-3">
          <PurchasedStatusForm itemId={item.id} itemName={item.name} projectId={projectId} purchased={item.purchased} />
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              className={`rounded-md border px-2 py-1 text-xs font-medium ${
                isEditing
                  ? "border-neutral-950 text-neutral-950"
                  : "border-neutral-300 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950"
              }`}
              onClick={() => setIsEditing((open) => !open)}
              type="button"
            >
              Edit
            </button>
            <form action={deleteRenovationCostItemAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="itemId" value={item.id} />
              <button className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-500 hover:border-neutral-950 hover:text-neutral-950">
                Delete
              </button>
            </form>
          </div>
        </td>
      </tr>
      {isEditing ? (
        <tr className="border-b border-neutral-200 last:border-0">
          <td colSpan={6} className="bg-neutral-50 px-4 py-3">
            <form onSubmit={saveExpense} className="grid gap-3 rounded-md border border-neutral-300 bg-white p-3 md:grid-cols-6">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="itemId" value={item.id} />
              <label className="grid gap-1 text-xs font-medium text-neutral-700 md:col-span-2">
                Item
                <input
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none focus:border-neutral-950"
                  defaultValue={item.name}
                  name="name"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-neutral-700">
                Amount
                <input
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none focus:border-neutral-950"
                  defaultValue={item.amount}
                  min="0"
                  name="amount"
                  required
                  step="0.01"
                  type="number"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-neutral-700">
                Supplier
                <input
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none focus:border-neutral-950"
                  defaultValue={item.supplier ?? ""}
                  name="supplier"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-neutral-700 md:col-span-2">
                Purchase link
                <input
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none focus:border-neutral-950"
                  defaultValue={item.purchaseUrl ?? ""}
                  name="purchaseUrl"
                  type="url"
                />
              </label>
              <fieldset className="grid gap-2 md:col-span-6">
                <legend className="text-xs font-medium text-neutral-700">Which section is it for?</legend>
                <div className="flex flex-wrap gap-2">
                  {costSectionOptions.map((option) => (
                    <label key={option}>
                      <input
                        className="peer sr-only"
                        defaultChecked={currentSection === option}
                        name="tag"
                        required
                        type="radio"
                        value={option}
                      />
                      <span className="inline-flex h-8 cursor-pointer items-center rounded-md border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition peer-checked:border-neutral-950 peer-checked:bg-neutral-950 peer-checked:text-white">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-1 text-xs font-medium text-neutral-700 md:col-span-5">
                Notes
                <input
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none focus:border-neutral-950"
                  defaultValue={item.notes ?? ""}
                  name="notes"
                />
              </label>
              <button
                className="h-9 self-end rounded-md bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-70"
                disabled={isSaving}
              >
                {isSaving ? "Saving" : "Save"}
              </button>
            </form>
          </td>
        </tr>
      ) : null}
    </>
  );
}
