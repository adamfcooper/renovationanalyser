import Link from "next/link";
import { BarChart3, Home, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/assumptions", label: "Assumptions", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-100">
      <header className="border-b border-neutral-300 bg-white text-neutral-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md border border-neutral-300 bg-white text-neutral-950">
              <BarChart3 size={21} />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold tracking-tight text-neutral-950">Renovation Deal Analyser</span>
              <span className="block text-xs text-neutral-500">UK renovation and flip calculator</span>
            </span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto rounded-md border border-neutral-300 bg-white p-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
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
