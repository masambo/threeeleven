"use client";

import { SignIn } from "@clerk/nextjs";
import { Lock, Radar, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* ── Left brand panel ── */}
      <section className="relative hidden flex-1 flex-col justify-between bg-blue-600 p-12 text-white lg:flex">
        <Logo size="lg" variant="dark" />

        <div className="max-w-md space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Authorised personnel only
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome to the Command Center
          </h1>
          <p className="text-base leading-relaxed text-blue-100">
            Coordinate community safety operations across Namibia. Monitor
            live alerts, track panic locations, and keep neighbourhoods
            informed.
          </p>

          <ul className="grid gap-4 pt-2">
            <FeatureRow
              description="See emergencies, reports and crime hotspots in real time."
              icon={Radar}
              title="Live operational map"
            />
            <FeatureRow
              description="Regional admins see only their assigned region."
              icon={ShieldCheck}
              title="Role-based access"
            />
            <FeatureRow
              description="Accounts are provisioned by your super admin team."
              icon={Lock}
              title="Invite-only access"
            />
          </ul>
        </div>

        <p className="text-xs text-blue-200">
          &copy; {new Date().getFullYear()} 3:11 Security &middot; Community
          neighbourhood watch platform
        </p>
      </section>

      {/* ── Right sign-in panel ── */}
      <section className="flex w-full items-center justify-center px-6 py-12 lg:w-[520px] lg:px-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center lg:hidden">
            <Logo size="md" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-0",
                  headerTitle: "text-slate-900 text-2xl font-semibold",
                  headerSubtitle: "text-slate-500 text-sm",
                  socialButtonsBlockButton:
                    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  socialButtonsBlockButtonText: "text-slate-700 font-medium",
                  dividerLine: "bg-slate-200",
                  dividerText:
                    "text-slate-400 text-xs uppercase tracking-wider",
                  formFieldLabel: "text-slate-700 font-medium",
                  formFieldInput:
                    "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100",
                  formButtonPrimary:
                    "bg-blue-600 hover:bg-blue-700 text-white font-semibold normal-case shadow-none",
                  identityPreviewText: "text-slate-900",
                  identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                  formResendCodeLink: "text-blue-600 hover:text-blue-700",
                  footerActionLink: "hidden",
                  footerAction: "hidden",
                  footer: "hidden",
                  footerActionText: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
                variables: {
                  colorPrimary: "#2563eb",
                  colorBackground: "#ffffff",
                  colorText: "#0f172a",
                  colorInputBackground: "#ffffff",
                  colorInputText: "#0f172a",
                  borderRadius: "8px",
                },
              }}
            />
          </div>

          <p className="text-center text-xs text-slate-500">
            Need access? Contact your super administrator to be added.
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureRow({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: typeof ShieldCheck;
  title: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
        <Icon size={18} />
      </span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-blue-100">{description}</p>
      </div>
    </li>
  );
}
