import Link from "next/link";
import type { ChangeEvent } from "react";
import type { CostSection, DealScore, ScenarioResult } from "@/lib/calculations";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

const scoreClasses: Record<DealScore, string> = {
  Excellent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Good: "border-sky-200 bg-sky-50 text-sky-800",
  Marginal: "border-amber-200 bg-amber-50 text-amber-800",
  Avoid: "border-rose-200 bg-rose-50 text-rose-800",
};

export function PageHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-1 text-sm font-medium text-neutral-500">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
    >
      {children}
    </Link>
  );
}

export function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    default: "border-neutral-300 bg-white",
    good: "border-emerald-200 bg-emerald-50",
    warn: "border-amber-200 bg-amber-50",
    bad: "border-rose-200 bg-rose-50",
  }[tone];

  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">{value}</p>
    </div>
  );
}

export function ScoreBadge({ score }: { score: DealScore }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${scoreClasses[score]}`}>
      {score}
    </span>
  );
}

export function CostTable({ title, section }: { title: string; section: CostSection }) {
  return (
    <details className="group rounded-md border border-neutral-300 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
        <span className="text-sm font-semibold text-neutral-700">{formatCurrency(section.total)}</span>
      </summary>
      <div className="border-t border-neutral-300">
        <table className="w-full text-sm">
          <tbody>
            {section.lines.map((line) => (
              <tr key={line.label} className="border-b border-neutral-200 last:border-0">
                <td className="px-4 py-2.5 text-neutral-700">
                  <span className="block">{line.label}</span>
                  {line.working ? <span className="mt-1 block text-xs text-neutral-500">{line.working}</span> : null}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-neutral-950">{formatCurrency(line.amount)}</td>
              </tr>
            ))}
            <tr className="bg-neutral-50">
              <td className="px-4 py-3 font-semibold text-neutral-950">Total</td>
              <td className="px-4 py-3 text-right font-semibold text-neutral-950">{formatCurrency(section.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function SensitivityTable({ scenarios }: { scenarios: ScenarioResult[] }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-neutral-950">Sensitivity Analysis</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Scenario</th>
              <th className="px-4 py-3 text-right">Sale price</th>
              <th className="px-4 py-3 text-right">Renovation</th>
              <th className="px-4 py-3 text-right">Months</th>
              <th className="px-4 py-3 text-right">All-in</th>
              <th className="px-4 py-3 text-right">Profit</th>
              <th className="px-4 py-3 text-right">ROI</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => (
              <tr key={scenario.name} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-950">{scenario.name}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(scenario.salePrice)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(scenario.renovationCosts)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(scenario.holdingMonths)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(scenario.allInCost)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(scenario.netProfit)}</td>
                <td className="px-4 py-3 text-right">{formatPercent(scenario.roiPercent)}</td>
                <td className="px-4 py-3 text-right"><ScoreBadge score={scenario.dealScore} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium ${disabled ? "text-neutral-400" : "text-neutral-800"}`}>
      {label}
      <input
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 focus:border-neutral-950"
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        step={step}
        disabled={disabled}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
      {label}
      <select
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex min-h-10 items-center gap-3 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800">
      <input
        checked={checked}
        className="size-4 accent-neutral-950"
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}
