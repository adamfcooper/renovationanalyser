"use client";

import { useState } from "react";
import Link from "next/link";
import { ScoreBadge } from "@/components/ui";
import type { DealScore } from "@/lib/calculations";

type Metric = {
  label: string;
  value: string;
  accent: "blue" | "green" | "red" | "slate";
};

type LiveRow = {
  id: string;
  name: string;
  propertyType: string;
  liveSpend: string;
  planned: string;
  allIn: string;
  profit: string;
  profitValue: number;
  roi: string;
  roiValue: number;
  score: DealScore;
};

type ForecastRow = {
  id: string;
  name: string;
  propertyType: string;
  purchase: string;
  sale: string;
  allIn: string;
  profit: string;
  profitValue: number;
  roi: string;
  roiValue: number;
  score: DealScore;
};

export function DashboardView({
  metrics,
  liveRows,
  forecastRows,
}: {
  metrics: Metric[];
  liveRows: LiveRow[];
  forecastRows: ForecastRow[];
}) {
  const [activeTab, setActiveTab] = useState<"live" | "forecasts">("live");

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-97px)] bg-neutral-100 px-4 py-8 text-neutral-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-500">Dashboard</p>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">Renovation pipeline</h1>
          </div>
          <DashboardAction href="/new">Analyse new deal</DashboardAction>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <DashboardMetric key={metric.label} {...metric} />
          ))}
        </div>

        <section className="mt-6 overflow-hidden rounded-md border border-neutral-300 bg-white">
          <div className="flex flex-col gap-4 border-b border-neutral-300 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="inline-grid grid-cols-2 rounded-md border border-neutral-300 bg-white p-1">
              <button
                className={`h-9 rounded-md px-4 text-sm font-semibold transition ${
                  activeTab === "live" ? "bg-neutral-950 text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
                onClick={() => setActiveTab("live")}
                type="button"
              >
                Live renovations
              </button>
              <button
                className={`h-9 rounded-md px-4 text-sm font-semibold transition ${
                  activeTab === "forecasts" ? "bg-neutral-950 text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
                onClick={() => setActiveTab("forecasts")}
                type="button"
              >
                Deal forecasts
              </button>
            </div>
            <DashboardAction href="/new">New deal</DashboardAction>
          </div>

          {activeTab === "live" ? <LiveTable rows={liveRows} /> : <ForecastTable rows={forecastRows} />}
        </section>
      </div>
    </div>
  );
}

function DashboardMetric({ label, value, accent }: Metric) {
  const accentClass = {
    blue: "border-sky-200 bg-sky-50",
    green: "border-emerald-200 bg-emerald-50",
    red: "border-rose-200 bg-rose-50",
    slate: "border-neutral-300 bg-white",
  }[accent];

  return (
    <div className={`rounded-md border p-4 ${accentClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">{value}</p>
    </div>
  );
}

function LiveTable({ rows }: { rows: LiveRow[] }) {
  return (
    <>
      <div className="grid gap-3 p-3 md:hidden">
        {rows.length > 0 ? (
          rows.map((row) => <LiveProjectCard key={row.id} row={row} />)
        ) : (
          <p className="px-1 py-5 text-sm text-neutral-500">No live renovations yet.</p>
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-300 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3 text-right">Live spend</th>
            <th className="px-4 py-3 text-right">Planned</th>
            <th className="px-4 py-3 text-right">All-in</th>
            <th className="px-4 py-3 text-right">Profit</th>
            <th className="px-4 py-3 text-right">ROI</th>
            <th className="px-4 py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-200 transition hover:bg-neutral-50 last:border-0">
              <td className="px-4 py-4">
                <Link href={`/projects/${row.id}`} className="font-medium text-neutral-950 transition hover:underline">
                  {row.name}
                </Link>
                <p className="text-xs text-neutral-500">{row.propertyType}</p>
              </td>
              <td className="px-4 py-4 text-right text-neutral-950">{row.liveSpend}</td>
              <td className="px-4 py-4 text-right text-neutral-700">{row.planned}</td>
              <td className="px-4 py-4 text-right text-neutral-700">{row.allIn}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.profitValue)}`}>{row.profit}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.roiValue)}`}>{row.roi}</td>
              <td className="px-4 py-4 text-right"><ScoreBadge score={row.score} /></td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-8 text-sm text-neutral-500" colSpan={7}>No live renovations yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </>
  );
}

function ForecastTable({ rows }: { rows: ForecastRow[] }) {
  return (
    <>
      <div className="grid gap-3 p-3 md:hidden">
        {rows.length > 0 ? (
          rows.map((row) => <ForecastProjectCard key={row.id} row={row} />)
        ) : (
          <p className="px-1 py-5 text-sm text-neutral-500">No deal forecasts yet.</p>
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-300 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3 text-right">Purchase</th>
            <th className="px-4 py-3 text-right">Sale</th>
            <th className="px-4 py-3 text-right">All-in</th>
            <th className="px-4 py-3 text-right">Profit</th>
            <th className="px-4 py-3 text-right">ROI</th>
            <th className="px-4 py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-200 transition hover:bg-neutral-50 last:border-0">
              <td className="px-4 py-4">
                <Link href={`/projects/${row.id}`} className="font-medium text-neutral-950 transition hover:underline">
                  {row.name}
                </Link>
                <p className="text-xs text-neutral-500">{row.propertyType}</p>
              </td>
              <td className="px-4 py-4 text-right text-neutral-700">{row.purchase}</td>
              <td className="px-4 py-4 text-right text-neutral-950">{row.sale}</td>
              <td className="px-4 py-4 text-right text-neutral-700">{row.allIn}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.profitValue)}`}>{row.profit}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.roiValue)}`}>{row.roi}</td>
              <td className="px-4 py-4 text-right"><ScoreBadge score={row.score} /></td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-8 text-sm text-neutral-500" colSpan={7}>No deal forecasts yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </>
  );
}

function LiveProjectCard({ row }: { row: LiveRow }) {
  return (
    <Link href={`/projects/${row.id}`} className="rounded-md border border-neutral-300 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-semibold text-neutral-950">{row.name}</p>
          <p className="mt-1 text-xs capitalize text-neutral-500">{row.propertyType}</p>
        </div>
        <ScoreBadge score={row.score} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <CardStat label="Live spend" value={row.liveSpend} />
        <CardStat label="Planned" value={row.planned} />
        <CardStat label="All-in" value={row.allIn} />
        <CardStat label="Profit" tone={numberTone(row.profitValue)} value={row.profit} />
        <CardStat label="ROI" tone={numberTone(row.roiValue)} value={row.roi} />
      </div>
    </Link>
  );
}

function ForecastProjectCard({ row }: { row: ForecastRow }) {
  return (
    <Link href={`/projects/${row.id}`} className="rounded-md border border-neutral-300 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-semibold text-neutral-950">{row.name}</p>
          <p className="mt-1 text-xs capitalize text-neutral-500">{row.propertyType}</p>
        </div>
        <ScoreBadge score={row.score} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <CardStat label="Purchase" value={row.purchase} />
        <CardStat label="Sale" value={row.sale} />
        <CardStat label="All-in" value={row.allIn} />
        <CardStat label="Profit" tone={numberTone(row.profitValue)} value={row.profit} />
        <CardStat label="ROI" tone={numberTone(row.roiValue)} value={row.roi} />
      </div>
    </Link>
  );
}

function CardStat({ label, tone = "text-neutral-950", value }: { label: string; tone?: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-neutral-50 p-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-1 break-words font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function numberTone(value: number) {
  if (value > 0) return "text-emerald-700";
  if (value < 0) return "text-rose-700";
  return "text-neutral-700";
}

function DashboardAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none"
    >
      {children}
    </Link>
  );
}
