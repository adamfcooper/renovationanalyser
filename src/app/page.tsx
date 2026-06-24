import { DashboardView } from "@/app/DashboardView";
import { getCalculatedProjects } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const deals = await getCalculatedProjects();
  const liveRenovations = deals.filter((deal) => deal.project.costItems.length > 0);
  const dealForecasts = deals.filter((deal) => deal.project.costItems.length === 0);
  const liveSpendTotal = liveRenovations.reduce((sum, deal) => sum + liveCostTotals(deal.project.costItems).purchased, 0);
  const liveRoi =
    liveRenovations.length > 0
      ? liveRenovations.reduce((sum, deal) => sum + deal.calculation.metrics.roiPercent, 0) / liveRenovations.length
      : 0;

  const metrics = [
    { label: "Live renos", value: String(liveRenovations.length), accent: "blue" as const },
    { label: "Live spend tracker", value: formatCurrency(liveSpendTotal), accent: "blue" as const },
    { label: "Live ROI", value: formatPercent(liveRoi), accent: liveRoi >= 10 ? "green" as const : "red" as const },
    { label: "Deal forecasts", value: String(dealForecasts.length), accent: "slate" as const },
  ];

  const liveRows = liveRenovations.map(({ project, calculation }) => {
    const liveTotals = liveCostTotals(project.costItems);

    return {
      id: project.id,
      name: project.name,
      propertyType: project.propertyType.toLowerCase().replaceAll("_", " "),
      liveSpend: formatCurrency(liveTotals.purchased),
      planned: formatCurrency(liveTotals.planned),
      allIn: formatCurrency(calculation.metrics.allInCost),
      profit: formatCurrency(calculation.metrics.netProfit),
      profitValue: calculation.metrics.netProfit,
      roi: formatPercent(calculation.metrics.roiPercent),
      roiValue: calculation.metrics.roiPercent,
      score: calculation.metrics.dealScore,
    };
  });

  const forecastRows = dealForecasts.map(({ project, calculation }) => ({
    id: project.id,
    name: project.name,
    propertyType: project.propertyType.toLowerCase().replaceAll("_", " "),
    purchase: formatCurrency(project.actualPurchasePrice),
    sale: formatCurrency(calculation.metrics.salePrice),
    allIn: formatCurrency(calculation.metrics.allInCost),
    profit: formatCurrency(calculation.metrics.netProfit),
    profitValue: calculation.metrics.netProfit,
    roi: formatPercent(calculation.metrics.roiPercent),
    roiValue: calculation.metrics.roiPercent,
    score: calculation.metrics.dealScore,
  }));

  return <DashboardView metrics={metrics} liveRows={liveRows} forecastRows={forecastRows} />;
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
