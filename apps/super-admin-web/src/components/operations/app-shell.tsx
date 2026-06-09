"use client";

import { UserButton } from "@clerk/nextjs";
import { Activity, Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { adminNavItems } from "@/lib/operations-data";
import { ConvexStatus } from "@/app/ConvexStatus";

export function OperationsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[var(--color-operations-bg)] p-4 text-[var(--color-app-foreground)] lg:p-6">
      <div className="grid min-h-[calc(100vh-32px)] overflow-hidden rounded-lg border border-[var(--color-operations-border)] bg-[#061927] lg:min-h-[calc(100vh-48px)] lg:grid-cols-[244px_1fr]">
        <aside className="hidden border-r border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] p-5 lg:block">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase text-[var(--color-brand)]">
              3:11 Security
            </p>
            <h1 className="mt-1 text-xl font-semibold">Admin Ops</h1>
          </div>
          <nav className="flex flex-col gap-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[var(--color-operations-panel-subtle)] text-[var(--color-brand)]"
                      : "text-slate-300 hover:bg-[var(--color-operations-panel-subtle)] hover:text-white"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-9 w-80 items-center gap-2 rounded-md border border-[var(--color-operations-border)] bg-[#061927] px-3 text-sm text-slate-400 md:flex">
                <Search aria-hidden size={16} />
                Search reports, alerts, users
              </div>
              <ConvexStatus />
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Activity"
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--color-operations-border)] text-slate-300 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <Activity aria-hidden size={17} />
              </button>
              <button
                aria-label="Notifications"
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--color-operations-border)] text-slate-300 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <Bell aria-hidden size={17} />
              </button>
              <UserButton />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 lg:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
