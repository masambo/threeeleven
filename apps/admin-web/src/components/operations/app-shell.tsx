"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ConvexStatus } from "@/app/ConvexStatus";
import { Logo } from "@/components/brand/logo";
import { adminNavItems } from "@/lib/operations-data";

export function OperationsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeNav = adminNavItems.find((item) =>
    item.href === "/dashboard"
      ? pathname === item.href
      : pathname.startsWith(item.href),
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[256px_1fr]">
        {/* ── Sidebar ── */}
        <aside className="hidden border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col">
          <Link className="mb-8 block" href="/dashboard">
            <Logo size="md" />
          </Link>

          <nav className="flex flex-1 flex-col gap-0.5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Operations
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon
                    aria-hidden
                    className={
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                    size={18}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Status card */}
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-xs font-semibold text-slate-700">
                System operational
              </p>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              All services online. Real-time updates active.
            </p>
          </div>
        </aside>

        {/* ── Main column ── */}
        <section className="flex min-w-0 flex-col">
          {/* Top bar */}
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="lg:hidden">
                <Logo showText={false} size="sm" />
              </div>
              <div className="hidden h-10 w-[360px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 focus-within:border-blue-400 focus-within:bg-white md:flex">
                <Search aria-hidden size={16} />
                <input
                  className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Search reports, alerts, users..."
                  type="search"
                />
                <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 lg:inline-flex">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ConvexStatus />
              <button
                aria-label="Notifications"
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
              >
                <Bell aria-hidden size={17} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>
              <div className="h-8 w-px bg-slate-200" />
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-blue-100",
                  },
                }}
              />
            </div>
          </header>

          {/* Page title strip */}
          {activeNav ? (
            <div className="hidden border-b border-slate-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:block">
              <span>3:11 Command</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-blue-600">{activeNav.label}</span>
            </div>
          ) : null}

          <div className="flex-1 overflow-auto px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
