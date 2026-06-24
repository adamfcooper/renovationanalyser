"use client";

import { useState } from "react";
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

export function NewDealForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const [flooringScope, setFlooringScope] = useState("NONE");
  const [plasteringScope, setPlasteringScope] = useState("NONE");
  const [needsPlumbing, setNeedsPlumbing] = useState(false);
  const [needsElectrical, setNeedsElectrical] = useState(false);

  return (
    <form action={action} className="grid gap-6">
      <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
        <h2 className="text-base font-semibold text-white">Property and pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Project name" name="name" required />
          <Field label="Project link" name="projectLink" type="url" />
          <Field label="Purchase price" name="actualPurchasePrice" type="number" step="0.01" required />
          <Field label="Total sq ft" name="internalSqFt" type="number" step="1" />
          <Field label="Kitchen sq ft" name="kitchenSqFt" type="number" step="0.01" />
          <Field label="Bathroom sq ft" name="bathroomSqFt" type="number" step="0.01" />
          <SelectField label="Property type" name="propertyType" defaultValue="BUNGALOW" options={propertyTypes} />
        </div>
      </section>

      <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
        <h2 className="text-base font-semibold text-white">Renovation scope</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CheckboxField label="Needs new kitchen" name="needsKitchen" />
          <CheckboxField label="Needs new bathroom" name="needsBathroom" />
          <CheckboxField label="Needs garden / exterior work" name="needsGardenWork" />
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <SelectField
              label="Flooring / carpets"
              name="flooringScope"
              value={flooringScope}
              onChange={(event) => setFlooringScope(event.target.value)}
              options={areaScopes}
            />
            <Field label="Flooring specific sq ft" name="flooringSqFt" type="number" step="0.01" disabled={flooringScope !== "SPECIFIC"} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <SelectField
              label="Plastering area"
              name="plasteringScope"
              value={plasteringScope}
              onChange={(event) => setPlasteringScope(event.target.value)}
              options={areaScopes}
            />
            <Field label="Plastering specific sq ft" name="plasteringSqFt" type="number" step="0.01" disabled={plasteringScope !== "SPECIFIC"} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <CheckboxField
              checked={needsPlumbing}
              label="Plumbing works"
              name="needsMinorPlumbing"
              onChange={(event) => setNeedsPlumbing(event.target.checked)}
            />
            <Field label="Plumbing estimated hours" name="plumbingHours" type="number" step="0.25" disabled={!needsPlumbing} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <CheckboxField
              checked={needsElectrical}
              label="Electrical works"
              name="needsMinorElectrical"
              onChange={(event) => setNeedsElectrical(event.target.checked)}
            />
            <Field label="Electrical estimated hours" name="electricalHours" type="number" step="0.25" disabled={!needsElectrical} />
          </div>
          <SelectField label="Decorator labour" name="decoratingLevel" defaultValue="NONE" options={tradeLevels} />
        </div>
      </section>

      <section className="rounded-md border border-slate-700 bg-[#171b22] p-4">
        <h2 className="text-base font-semibold text-white">Holding, finance and targets</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SelectField label="Finance type" name="financeType" defaultValue="MORTGAGE" options={financeTypes} />
          <Field label="Deposit amount" name="depositAmount" type="number" step="0.01" />
          <Field label="Mortgage interest rate %" name="mortgageInterestRate" type="number" step="0.01" />
          <Field label="Mortgage term years" name="mortgageTermYears" type="number" step="1" defaultValue={25} />
          <Field label="Council tax per month" name="councilTaxPerMonth" type="number" step="0.01" defaultValue={190} />
          <Field label="Utilities per month" name="utilitiesPerMonth" type="number" step="0.01" defaultValue={113} />
          <Field label="Insurance per month" name="insurancePerMonth" type="number" step="0.01" defaultValue={10} />
          <Field label="Expected holding months" name="estimatedHoldingMonths" type="number" step="1" defaultValue={9} required />
        </div>
      </section>

      <div className="flex justify-end">
        <button className="h-11 rounded-md bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-400">
          Generate estimate
        </button>
      </div>
    </form>
  );
}
