"use client";

import { useMemo, useState } from "react";
import { CheckboxField, Field, SelectField } from "@/components/ui";

const propertyTypes = [
  { label: "Bungalow", value: "BUNGALOW" },
  { label: "Terrace", value: "TERRACE" },
  { label: "Semi", value: "SEMI" },
  { label: "Detached", value: "DETACHED" },
  { label: "Flat", value: "FLAT" },
];

const financeTypes = [
  { label: "Cash", value: "CASH" },
  { label: "Mortgage", value: "MORTGAGE" },
  { label: "Bridging", value: "BRIDGING" },
];

const tradeLevels = [
  { label: "None", value: "NONE" },
  { label: "Light", value: "LIGHT" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Heavy", value: "HEAVY" },
];

const areaScopes = [
  { label: "No", value: "NONE" },
  { label: "Whole house", value: "WHOLE" },
  { label: "Specific sq ft", value: "SPECIFIC" },
];

type EditableProject = {
  id: string;
  name: string;
  projectLink: string | null;
  propertyType: string;
  internalSqFt: number | null;
  kitchenSqFt: number | null;
  bathroomSqFt: number | null;
  flooringSqFt: number | null;
  plasteringSqFt: number | null;
  plumbingHours: number | null;
  electricalHours: number | null;
  actualPurchasePrice: number;
  estimatedSalePrice: number;
  needsKitchen: boolean;
  needsBathroom: boolean;
  needsFlooring: boolean;
  needsDecorating: boolean;
  needsMinorPlumbing: boolean;
  needsMinorElectrical: boolean;
  needsGardenWork: boolean;
  decoratingLevel: string;
  estimatedHoldingMonths: number;
  financeType: string;
  depositAmount: number | null;
  mortgageInterestRate: number | null;
  mortgageTermYears: number | null;
  councilTaxPerMonth: number | null;
  utilitiesPerMonth: number | null;
  insurancePerMonth: number | null;
  survey: number | null;
  purchaseLegalFees: number | null;
  brokerFee: number | null;
  estateAgentPercentage: number | null;
  saleLegalFees: number | null;
  capitalGainsTax: number | null;
  contingencyPercentage: number | null;
  notes: string | null;
};

export function EditProjectForm({
  action,
  project,
}: {
  action: (formData: FormData) => void | Promise<void>;
  project: EditableProject;
}) {
  const initialFlooringScope = useMemo(() => areaScopeFor(project.needsFlooring, project.flooringSqFt, project.internalSqFt), [project]);
  const initialPlasteringScope = useMemo(() => areaScopeFor(Boolean(project.plasteringSqFt), project.plasteringSqFt, project.internalSqFt), [project]);
  const [flooringScope, setFlooringScope] = useState(initialFlooringScope);
  const [plasteringScope, setPlasteringScope] = useState(initialPlasteringScope);
  const [needsPlumbing, setNeedsPlumbing] = useState(project.needsMinorPlumbing);
  const [needsElectrical, setNeedsElectrical] = useState(project.needsMinorElectrical);

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="projectId" value={project.id} />

      <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
        <h2 className="text-base font-semibold text-white">Property and pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Project name" name="name" defaultValue={project.name} required />
          <Field label="Project link" name="projectLink" type="url" defaultValue={project.projectLink} />
          <Field label="Purchase price" name="actualPurchasePrice" type="number" step="0.01" defaultValue={project.actualPurchasePrice} required />
          <Field label="Assumed sale price" name="estimatedSalePrice" type="number" step="0.01" defaultValue={project.estimatedSalePrice} required />
          <Field label="Total sq ft" name="internalSqFt" type="number" step="1" defaultValue={project.internalSqFt} />
          <Field label="Kitchen sq ft" name="kitchenSqFt" type="number" step="0.01" defaultValue={project.kitchenSqFt} />
          <Field label="Bathroom sq ft" name="bathroomSqFt" type="number" step="0.01" defaultValue={project.bathroomSqFt} />
          <SelectField label="Property type" name="propertyType" defaultValue={project.propertyType} options={propertyTypes} />
        </div>
      </section>

      <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
        <h2 className="text-base font-semibold text-white">Renovation scope</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CheckboxField label="Needs new kitchen" name="needsKitchen" defaultChecked={project.needsKitchen} />
          <CheckboxField label="Needs new bathroom" name="needsBathroom" defaultChecked={project.needsBathroom} />
          <CheckboxField label="Needs brilliant white paint" name="needsDecorating" defaultChecked={project.needsDecorating} />
          <CheckboxField label="Needs garden / exterior work" name="needsGardenWork" defaultChecked={project.needsGardenWork} />
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <SelectField
              label="Flooring / carpets"
              name="flooringScope"
              value={flooringScope}
              onChange={(event) => setFlooringScope(event.target.value)}
              options={areaScopes}
            />
            <Field
              label="Flooring specific sq ft"
              name="flooringSqFt"
              type="number"
              step="0.01"
              defaultValue={flooringScope === "SPECIFIC" ? project.flooringSqFt : null}
              disabled={flooringScope !== "SPECIFIC"}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <SelectField
              label="Plastering area"
              name="plasteringScope"
              value={plasteringScope}
              onChange={(event) => setPlasteringScope(event.target.value)}
              options={areaScopes}
            />
            <Field
              label="Plastering specific sq ft"
              name="plasteringSqFt"
              type="number"
              step="0.01"
              defaultValue={plasteringScope === "SPECIFIC" ? project.plasteringSqFt : null}
              disabled={plasteringScope !== "SPECIFIC"}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <CheckboxField
              checked={needsPlumbing}
              label="Plumbing works"
              name="needsMinorPlumbing"
              onChange={(event) => setNeedsPlumbing(event.target.checked)}
            />
            <Field label="Plumbing estimated hours" name="plumbingHours" type="number" step="0.25" defaultValue={project.plumbingHours} disabled={!needsPlumbing} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <CheckboxField
              checked={needsElectrical}
              label="Electrical works"
              name="needsMinorElectrical"
              onChange={(event) => setNeedsElectrical(event.target.checked)}
            />
            <Field label="Electrical estimated hours" name="electricalHours" type="number" step="0.25" defaultValue={project.electricalHours} disabled={!needsElectrical} />
          </div>
          <SelectField label="Decorator labour" name="decoratingLevel" defaultValue={project.decoratingLevel} options={tradeLevels} />
        </div>
      </section>

      <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
        <h2 className="text-base font-semibold text-white">Holding and finance</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SelectField label="Finance type" name="financeType" defaultValue={project.financeType} options={financeTypes} />
          <Field label="Deposit amount" name="depositAmount" type="number" step="0.01" defaultValue={project.depositAmount} />
          <Field label="Mortgage interest rate %" name="mortgageInterestRate" type="number" step="0.01" defaultValue={project.mortgageInterestRate} />
          <Field label="Mortgage term years" name="mortgageTermYears" type="number" step="1" defaultValue={project.mortgageTermYears ?? 25} />
          <Field label="Council tax per month" name="councilTaxPerMonth" type="number" step="0.01" defaultValue={project.councilTaxPerMonth} />
          <Field label="Utilities per month" name="utilitiesPerMonth" type="number" step="0.01" defaultValue={project.utilitiesPerMonth} />
          <Field label="Insurance per month" name="insurancePerMonth" type="number" step="0.01" defaultValue={project.insurancePerMonth} />
          <Field label="Expected holding months" name="estimatedHoldingMonths" type="number" step="1" defaultValue={project.estimatedHoldingMonths} required />
        </div>
      </section>

      <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
        <h2 className="text-base font-semibold text-white">Fees and notes</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Survey" name="survey" type="number" step="0.01" defaultValue={project.survey} />
          <Field label="Purchase legal fees" name="purchaseLegalFees" type="number" step="0.01" defaultValue={project.purchaseLegalFees} />
          <Field label="Broker fee" name="brokerFee" type="number" step="0.01" defaultValue={project.brokerFee} />
          <Field label="Estate agent fee %" name="estateAgentPercentage" type="number" step="0.01" defaultValue={project.estateAgentPercentage ?? 1.2} />
          <Field label="Sale legal fees" name="saleLegalFees" type="number" step="0.01" defaultValue={project.saleLegalFees} />
          <Field label="Capital gains tax" name="capitalGainsTax" type="number" step="0.01" defaultValue={project.capitalGainsTax} />
          <Field label="Contingency %" name="contingencyPercentage" type="number" step="0.01" defaultValue={project.contingencyPercentage ?? 0} />
          <label className="grid gap-1.5 text-sm font-medium text-slate-200 md:col-span-2 lg:col-span-4">
            Notes
            <textarea
              className="min-h-28 rounded-md border border-slate-700 bg-[#111318] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              name="notes"
              defaultValue={project.notes ?? ""}
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="h-11 rounded-md bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-400">
          Save changes
        </button>
      </div>
    </form>
  );
}

function areaScopeFor(enabled: boolean, area: number | null, internalSqFt: number | null) {
  if (!enabled && !area) return "NONE";
  if (area && internalSqFt && Math.abs(area - internalSqFt) < 0.01) return "WHOLE";
  return "SPECIFIC";
}
