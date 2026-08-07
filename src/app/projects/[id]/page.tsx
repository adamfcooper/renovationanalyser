import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";
import {
  addRenovationCostItemAction,
  deleteRenovationCostItemAction,
} from "@/app/actions";
import { PurchasedStatusForm } from "@/components/purchased-status-form";
import { ReceiptUploadForm } from "@/components/receipt-upload-form";
import { ButtonLink, CostTable, Metric, PageHeader, ScoreBadge } from "@/components/ui";
import { costSectionOptions } from "@/lib/cost-sections";
import { getCalculatedProject } from "@/lib/data";
import { formatCurrency, formatNumber, formatPercent, labelize } from "@/lib/format";
import { liveCostGroupForTag, renovationTag } from "@/lib/tags";

export const dynamic = "force-dynamic";

type RenovationCostItem = NonNullable<Awaited<ReturnType<typeof getCalculatedProject>>> extends { project: { costItems: infer T } }
  ? T extends Array<infer U>
    ? U
    : never
  : never;

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getCalculatedProject(id);
  if (!deal) notFound();

  const { project, calculation } = deal;
  const metrics = calculation.metrics;
  const purchasedTotal = project.costItems
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + item.amount, 0);
  const plannedTotal = project.costItems
    .filter((item) => !item.purchased)
    .reduce((sum, item) => sum + item.amount, 0);
  const trackedTotal = purchasedTotal + plannedTotal;
  const groupedCostItems = groupRenovationCostItems(project.costItems);

  return (
    <>
      <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-950">
        <ArrowLeft size={16} />
        Dashboard
      </Link>
      <PageHeader
        eyebrow={labelize(project.propertyType)}
        title={project.name}
        action={
          <div className="flex items-center gap-2">
            <ButtonLink href={`/projects/${project.id}/edit`}>Edit project</ButtonLink>
            <ScoreBadge score={metrics.dealScore} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Sale price" value={formatCurrency(metrics.salePrice)} />
        <Metric label="All-in cost" value={formatCurrency(metrics.allInCost)} />
        <Metric label="Net profit" value={formatCurrency(metrics.netProfit)} tone={metrics.netProfit >= 25000 ? "good" : "warn"} />
        <Metric label="ROI" value={formatPercent(metrics.roiPercent)} tone={metrics.roiPercent >= 12 ? "good" : metrics.roiPercent >= 6 ? "warn" : "bad"} />
      </div>

      <section className="mt-6 rounded-md border border-neutral-300 bg-white p-4">
        <h2 className="text-base font-semibold text-neutral-950">Property summary</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Type" value={labelize(project.propertyType)} />
          <SummaryLink label="Listing link" href={project.projectLink} />
          <Summary label="Total size" value={formatNumber(project.internalSqFt, " sq ft")} />
          <Summary label="Kitchen size" value={formatNumber(project.kitchenSqFt, " sq ft")} />
          <Summary label="Bathroom size" value={formatNumber(project.bathroomSqFt, " sq ft")} />
          <Summary label="Flooring area" value={formatNumber(project.flooringSqFt, " sq ft")} />
          <Summary label="Plastering area" value={formatNumber(project.plasteringSqFt, " sq ft")} />
          <Summary label="Finance type" value={labelize(project.financeType)} />
          <Summary label="Deposit" value={formatCurrency(project.depositAmount)} />
          <Summary label="Interest rate" value={formatPercent(project.mortgageInterestRate)} />
          <Summary label="Mortgage term" value={formatNumber(project.mortgageTermYears, " years")} />
          <Summary label="Purchase £/sq ft" value={formatCurrency(metrics.purchasePricePerSqFt)} />
          <Summary label="Renovation £/sq ft" value={formatCurrency(metrics.renovationCostPerSqFt)} />
          <Summary label="Sale £/sq ft" value={formatCurrency(metrics.salePricePerSqFt)} />
          <Summary label="Break-even sale price" value={formatCurrency(metrics.breakEvenSalePrice)} />
          <Summary label="Profit £/sq ft" value={formatCurrency(metrics.profitPerSqFt)} />
        </dl>
      </section>

      <section className="mt-6 rounded-md border border-neutral-300 bg-white">
        <div className="border-b border-neutral-300 px-4 py-3">
          <h2 className="text-base font-semibold text-neutral-950">Sale price guidance</h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {metrics.salePriceGuidance.map((band) => (
              <tr key={band.label} className="border-b border-neutral-200 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-950">{band.label}</td>
                <td className="px-4 py-3 text-right text-neutral-700">{formatSalePriceBand(band.minimumSalePrice, band.maximumSalePrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {calculation.warnings.length > 0 ? (
        <section className="mt-6 rounded-md border border-neutral-300 bg-white p-4">
          <h2 className="text-base font-semibold text-neutral-950">Warnings</h2>
          <ul className="mt-3 grid gap-2 text-sm text-neutral-700">
            {calculation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <CostTable title="Acquisition costs" section={calculation.acquisition} />
        <CostTable title="Renovation costs" section={calculation.renovation} />
        <CostTable title="Holding costs" section={calculation.holding} />
        <CostTable title="Disposal costs" section={calculation.disposal} />
      </div>

      <section className="mt-6 rounded-md border border-neutral-300 bg-white">
        <div className="border-b border-neutral-300 px-4 py-3">
          <h2 className="text-base font-semibold text-neutral-950">Live renovation costs</h2>
        </div>
        <div className="grid gap-4 border-b border-neutral-300 p-4 md:grid-cols-3">
          <Metric label="Purchased" value={formatCurrency(purchasedTotal)} tone="good" />
          <Metric label="Planned" value={formatCurrency(plannedTotal)} tone="warn" />
          <Metric label="Tracked total" value={formatCurrency(trackedTotal)} />
        </div>

        {project.costItems.length > 0 ? (
          <div className="grid gap-3 border-b border-neutral-300 p-4">
            {groupedCostItems.map((group) => (
              <LiveCostGroup key={group.title} group={group} projectId={project.id} />
            ))}
          </div>
        ) : (
          <div className="border-b border-neutral-300 p-4 text-sm text-neutral-500">
            No live costs tracked yet. Add purchases, planned items, supplier links, and choose a section below.
          </div>
        )}

        <form action={addRenovationCostItemAction} className="grid gap-4 p-4 lg:grid-cols-6">
          <input type="hidden" name="projectId" value={project.id} />
          <label className="grid gap-1.5 text-sm font-medium text-neutral-800 lg:col-span-2">
            Item
            <input
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950"
              name="name"
              placeholder="Tiles, taps, paint..."
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
            Amount
            <input
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950"
              min="0"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
            Supplier
            <input
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950"
              name="supplier"
              placeholder="B&Q"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
            Purchase link
            <input
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950"
              name="purchaseUrl"
              placeholder="https://..."
              type="url"
            />
          </label>
          <fieldset className="grid gap-2 lg:col-span-6">
            <legend className="text-sm font-medium text-neutral-800">Which section is it for?</legend>
            <div className="flex flex-wrap gap-2">
              {costSectionOptions.map((option) => (
                <label key={option}>
                  <input
                    className="peer sr-only"
                    defaultChecked={option === "Misc"}
                    name="tag"
                    required
                    type="radio"
                    value={option}
                  />
                  <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition peer-checked:border-neutral-950 peer-checked:bg-neutral-950 peer-checked:text-white">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-800 lg:col-span-4">
            Notes
            <input
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950"
              name="notes"
              placeholder="Room, quantity, colour, delivery note..."
            />
          </label>
          <label className="flex min-h-10 items-center gap-3 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800">
            <input className="size-4 accent-neutral-950" name="purchased" type="checkbox" />
            Purchased
          </label>
          <button className="h-10 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800">
            Add item
          </button>
        </form>
        <ReceiptUploadForm projectId={project.id} />
      </section>

      {displayProjectNotes(project.notes) ? (
        <section className="mt-6 rounded-md border border-neutral-300 bg-white p-4">
          <h2 className="text-base font-semibold text-neutral-950">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{displayProjectNotes(project.notes)}</p>
        </section>
      ) : null}
    </>
  );
}

function LiveCostGroup({
  group,
  projectId,
}: {
  group: {
    items: RenovationCostItem[];
    planned: number;
    purchased: number;
    title: string;
    total: number;
  };
  projectId: string;
}) {
  return (
    <details className="group rounded-md border border-neutral-300 bg-white">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <div>
          <h3 className="font-semibold text-neutral-950">{group.title}</h3>
          <p className="mt-1 text-xs text-neutral-500">
            {group.items.length} {group.items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-800">
            Purchased {formatCurrency(group.purchased)}
          </span>
          <span className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-800">
            Planned {formatCurrency(group.planned)}
          </span>
          <span className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-800">
            Total {formatCurrency(group.total)}
          </span>
          <ChevronDown className="text-neutral-500 transition group-open:rotate-180" size={18} />
        </div>
      </summary>

      {group.items.length > 0 ? (
        <div className="overflow-x-auto border-t border-neutral-300">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-700">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Tag</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <LiveCostRow key={item.id} item={item} projectId={projectId} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-t border-neutral-300 px-4 py-5 text-sm text-neutral-500">No costs in this section yet.</div>
      )}
    </details>
  );
}

function LiveCostRow({ item, projectId }: { item: RenovationCostItem; projectId: string }) {
  return (
    <tr className="border-b border-neutral-200 last:border-0">
      <td className="px-4 py-3">
        <span className="font-medium text-neutral-950">{item.name}</span>
        {item.notes ? <span className="mt-1 block text-xs text-neutral-500">{item.notes}</span> : null}
      </td>
      <td className="px-4 py-3 text-neutral-700">{renovationTag(item.tag)}</td>
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
        <form action={deleteRenovationCostItemAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="itemId" value={item.id} />
          <button className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-500 hover:border-neutral-950 hover:text-neutral-950">
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}

function groupRenovationCostItems(items: RenovationCostItem[]) {
  const groups = [
    { title: "Kitchen", items: [] as RenovationCostItem[] },
    { title: "Bathroom", items: [] as RenovationCostItem[] },
    { title: "Flooring", items: [] as RenovationCostItem[] },
    { title: "Misc", items: [] as RenovationCostItem[] },
  ];

  for (const item of items) {
    const groupTitle = liveCostGroupForTag(item.tag, item.name);
    if (groupTitle === "Kitchen") {
      groups[0].items.push(item);
    } else if (groupTitle === "Bathroom") {
      groups[1].items.push(item);
    } else if (groupTitle === "Flooring") {
      groups[2].items.push(item);
    } else {
      groups[3].items.push(item);
    }
  }

  return groups.map((group) => {
    const purchased = group.items.filter((item) => item.purchased).reduce((sum, item) => sum + item.amount, 0);
    const planned = group.items.filter((item) => !item.purchased).reduce((sum, item) => sum + item.amount, 0);

    return {
      ...group,
      planned,
      purchased,
      total: purchased + planned,
    };
  });
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-1 font-medium text-neutral-950">{value}</dd>
    </div>
  );
}

function SummaryLink({ label, href }: { label: string; href: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-1 font-medium">
        {href ? (
          <a className="inline-flex items-center gap-1 text-neutral-950 hover:text-neutral-700" href={href} rel="noreferrer" target="_blank">
            Open listing
            <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-neutral-950">n/a</span>
        )}
      </dd>
    </div>
  );
}

function formatSalePriceBand(minimum: number | null, maximum: number | null) {
  if (minimum === null) return "n/a";
  if (maximum === null) return formatCurrency(minimum);
  return `${formatCurrency(minimum)} - ${formatCurrency(maximum)}`;
}

function displayProjectNotes(notes: string | null) {
  return notes?.replace(/\[seed:[^\]]+\]/g, "").trim() ?? "";
}
