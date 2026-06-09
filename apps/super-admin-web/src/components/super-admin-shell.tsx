"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ConvexStatus } from "@/app/ConvexStatus";
import { superAdminNavItems } from "@/lib/super-admin-nav";

export function SuperAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[var(--color-operations-bg)] p-4 text-[var(--color-app-foreground)] lg:p-6">
      <div className="grid min-h-[calc(100vh-32px)] overflow-hidden rounded-lg border border-[var(--color-operations-border)] bg-[#061927] lg:min-h-[calc(100vh-48px)] lg:grid-cols-[244px_1fr]">
        <aside className="hidden border-r border-[var(--color-operations-border)] bg-[var(--color-operations-panel)] p-5 lg:block">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase text-[var(--color-brand)]">
              3:11 Security
            </p>
            <h1 className="mt-1 text-xl font-semibold">Super Admin</h1>
          </div>
          <nav className="flex flex-col gap-1">
            {superAdminNavItems.map((item) => {
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
            <ConvexStatus />
            <UserButton />
          </div>
          <div className="flex-1 overflow-auto p-4 lg:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
