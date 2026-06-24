import { updateAssumptionsAction } from "@/app/actions";
import { Field, PageHeader } from "@/components/ui";
import { getAssumptions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AssumptionsPage() {
  const assumptions = await getAssumptions();

  return (
    <>
      <PageHeader eyebrow="Assumptions" title="Edit default cost assumptions" />

      <form action={updateAssumptionsAction} className="grid gap-6">
        <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
          <h2 className="text-base font-semibold text-white">Renovation costs</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MoneyField label="Flooring default" name="flooringDefault" value={assumptions.flooringDefault} />
            <MoneyField label="Decorating default" name="decoratingDefault" value={assumptions.decoratingDefault} />
            <MoneyField label="Garden / exterior default" name="gardenDefault" value={assumptions.gardenDefault} />
            <MoneyField label="Brilliant white paint £/sq ft" name="renovationCostPerSqFt" value={assumptions.renovationCostPerSqFt} />
            <MoneyField label="Kitchen £/sq ft" name="kitchenRenoCostPerSqFt" value={assumptions.kitchenRenoCostPerSqFt} />
            <MoneyField label="Bathroom £/sq ft" name="bathroomRenoCostPerSqFt" value={assumptions.bathroomRenoCostPerSqFt} />
            <MoneyField label="Flooring £/sq ft" name="flooringCostPerSqFt" value={assumptions.flooringCostPerSqFt} />
            <MoneyField label="Plastering £/sq ft" name="plasteringCostPerSqFt" value={assumptions.plasteringCostPerSqFt} />
            <MoneyField label="Skip price" name="skipCost" value={assumptions.skipCost} />
            <Field label="Skip coverage sq ft" name="skipCoverageSqFt" type="number" step="1" defaultValue={assumptions.skipCoverageSqFt} />
            <MoneyField label="Acquisition £/sq ft benchmark" name="acquisitionCostPerSqFt" value={assumptions.acquisitionCostPerSqFt} />
            <Field label="Contingency %" name="contingencyPercentage" type="number" step="0.01" defaultValue={assumptions.contingencyPercentage} />
          </div>
        </section>

        <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
          <h2 className="text-base font-semibold text-white">Trade labour assumptions</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MoneyField label="Plumbing hourly rate" name="plumbingDayRate" value={assumptions.plumbingDayRate} />
            <MoneyField label="Electrician hourly rate" name="electricianDayRate" value={assumptions.electricianDayRate} />
            <MoneyField label="Decorator day rate" name="decoratorDayRate" value={assumptions.decoratorDayRate} />
            <Field label="Light days" name="lightTradeDays" type="number" step="0.25" defaultValue={assumptions.lightTradeDays} />
            <Field label="Medium days" name="mediumTradeDays" type="number" step="0.25" defaultValue={assumptions.mediumTradeDays} />
            <Field label="Heavy days" name="heavyTradeDays" type="number" step="0.25" defaultValue={assumptions.heavyTradeDays} />
          </div>
        </section>

        <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
          <h2 className="text-base font-semibold text-white">Holding costs</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MoneyField label="Mortgage / finance per month" name="mortgageCostPerMonth" value={assumptions.mortgageCostPerMonth} />
            <MoneyField label="Council tax per month" name="councilTaxPerMonth" value={assumptions.councilTaxPerMonth} />
            <MoneyField label="Utilities per month" name="utilitiesPerMonth" value={assumptions.utilitiesPerMonth} />
            <MoneyField label="Insurance per month" name="insurancePerMonth" value={assumptions.insurancePerMonth} />
          </div>
        </section>

        <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
          <h2 className="text-base font-semibold text-white">Acquisition costs</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MoneyField label="Purchase legal fees" name="purchaseLegalFees" value={assumptions.purchaseLegalFees} />
            <MoneyField label="Survey" name="survey" value={assumptions.survey} />
            <MoneyField label="Broker fee" name="brokerFee" value={assumptions.brokerFee} />
          </div>
        </section>

        <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
          <h2 className="text-base font-semibold text-white">Disposal costs</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Estate agent %" name="estateAgentPercentage" type="number" step="0.01" defaultValue={assumptions.estateAgentPercentage} />
            <MoneyField label="Sale legal fees" name="saleLegalFees" value={assumptions.saleLegalFees} />
          </div>
        </section>

        <div className="flex justify-end">
          <button className="h-11 rounded-md bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-400">
            Save assumptions
          </button>
        </div>
      </form>
    </>
  );
}

function MoneyField({ label, name, value }: { label: string; name: string; value: number | null }) {
  return <Field label={label} name={name} type="number" step="0.01" defaultValue={value} />;
}
