import Link from "next/link";
import { BarChart3, Home, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/assumptions", label: "Assumptions", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090b10]">
      <header className="border-b border-white/10 bg-[#090b10]/85 text-slate-100 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md border border-white/10 bg-white/[0.07] text-sky-200 shadow-inner shadow-white/5">
              <BarChart3 size={21} />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight text-white">Renovation Deal Analyser</span>
              <span className="block text-xs text-slate-500">UK renovation and flip calculator</span>
            </span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.045] p-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
