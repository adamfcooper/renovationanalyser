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
    <div className="-mx-4 -my-6 min-h-[calc(100vh-97px)] bg-[#090b10] px-4 py-8 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-400">Dashboard</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Renovation pipeline</h1>
          </div>
          <DashboardAction href="/new">Analyse new deal</DashboardAction>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <DashboardMetric key={metric.label} {...metric} />
          ))}
        </div>

        <section className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="inline-grid grid-cols-2 rounded-lg border border-white/10 bg-black/35 p-1 shadow-inner shadow-black/30">
              <button
                className={`h-9 rounded-md px-4 text-sm font-semibold transition ${
                  activeTab === "live" ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("live")}
                type="button"
              >
                Live renovations
              </button>
              <button
                className={`h-9 rounded-md px-4 text-sm font-semibold transition ${
                  activeTab === "forecasts" ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
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
    blue: "from-sky-400/20 text-sky-200",
    green: "from-emerald-400/20 text-emerald-200",
    red: "from-rose-400/20 text-rose-200",
    slate: "from-white/10 text-slate-200",
  }[accent];

  return (
    <div className={`rounded-lg border border-white/10 bg-gradient-to-br ${accentClass} to-white/[0.045] p-4 shadow-xl shadow-black/20 backdrop-blur-xl`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function LiveTable({ rows }: { rows: LiveRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.035] text-left text-xs uppercase tracking-wide text-slate-400">
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
            <tr key={row.id} className="border-b border-white/10 transition hover:bg-white/[0.035] last:border-0">
              <td className="px-4 py-4">
                <Link href={`/projects/${row.id}`} className="font-medium text-white transition hover:text-sky-200">
                  {row.name}
                </Link>
                <p className="text-xs text-slate-400">{row.propertyType}</p>
              </td>
              <td className="px-4 py-4 text-right text-sky-200">{row.liveSpend}</td>
              <td className="px-4 py-4 text-right text-slate-300">{row.planned}</td>
              <td className="px-4 py-4 text-right text-slate-200">{row.allIn}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.profitValue)}`}>{row.profit}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.roiValue)}`}>{row.roi}</td>
              <td className="px-4 py-4 text-right"><ScoreBadge score={row.score} /></td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-8 text-sm text-slate-400" colSpan={7}>No live renovations yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ForecastTable({ rows }: { rows: ForecastRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.035] text-left text-xs uppercase tracking-wide text-slate-400">
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
            <tr key={row.id} className="border-b border-white/10 transition hover:bg-white/[0.035] last:border-0">
              <td className="px-4 py-4">
                <Link href={`/projects/${row.id}`} className="font-medium text-white transition hover:text-sky-200">
                  {row.name}
                </Link>
                <p className="text-xs text-slate-400">{row.propertyType}</p>
              </td>
              <td className="px-4 py-4 text-right text-slate-300">{row.purchase}</td>
              <td className="px-4 py-4 text-right text-sky-200">{row.sale}</td>
              <td className="px-4 py-4 text-right text-slate-300">{row.allIn}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.profitValue)}`}>{row.profit}</td>
              <td className={`px-4 py-4 text-right font-medium ${numberTone(row.roiValue)}`}>{row.roi}</td>
              <td className="px-4 py-4 text-right"><ScoreBadge score={row.score} /></td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-8 text-sm text-slate-400" colSpan={7}>No deal forecasts yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function numberTone(value: number) {
  if (value > 0) return "text-emerald-300";
  if (value < 0) return "text-rose-300";
  return "text-slate-300";
}

function DashboardAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-white/50"
    >
      {children}
    </Link>
  );
}
