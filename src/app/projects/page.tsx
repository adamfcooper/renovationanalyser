import Link from "next/link";
import { ButtonLink, PageHeader, ScoreBadge } from "@/components/ui";
import { getCalculatedProjects } from "@/lib/data";
import { formatCurrency, formatNumber, formatPercent, labelize } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const deals = await getCalculatedProjects();

  return (
    <>
      <PageHeader eyebrow="Projects" title="Analysed renovation deals" action={<ButtonLink href="/new">New deal</ButtonLink>} />

      <section className="rounded-md border border-neutral-300 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-700">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Purchase</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-right">Live spend</th>
                <th className="px-4 py-3 text-right">Planned</th>
                <th className="px-4 py-3 text-right">Sale</th>
                <th className="px-4 py-3 text-right">All-in</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-right">ROI</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(({ project, calculation }) => {
                const liveTotals = liveCostTotals(project.costItems);

                return (
                  <tr key={project.id} className="border-b border-neutral-200 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${project.id}`} className="font-medium text-neutral-950 hover:text-neutral-950">
                        {project.name}
                      </Link>
                      <p className="text-xs text-neutral-500">{labelize(project.propertyType)}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{labelize(project.propertyType)}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{formatCurrency(project.actualPurchasePrice)}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{formatNumber(project.internalSqFt, " sq ft")}</td>
                    <td className="px-4 py-3 text-right text-neutral-950">{formatCurrency(liveTotals.purchased)}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{formatCurrency(liveTotals.planned)}</td>
                    <td className="px-4 py-3 text-right text-neutral-950">{formatCurrency(project.estimatedSalePrice)}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{formatCurrency(calculation.metrics.allInCost)}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{formatCurrency(calculation.metrics.netProfit)}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{formatPercent(calculation.metrics.roiPercent)}</td>
                    <td className="px-4 py-3 text-right"><ScoreBadge score={calculation.metrics.dealScore} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function liveCostTotals(costItems: { amount: number; purchased: boolean }[]) {
  return costItems.reduce(
    (totals, item) => ({
      purchased: totals.purchased + (item.purchased ? item.amount : 0),
      planned: totals.planned + (item.purchased ? 0 : item.amount),
    }),
    { purchased: 0, planned: 0 },
  );
}
