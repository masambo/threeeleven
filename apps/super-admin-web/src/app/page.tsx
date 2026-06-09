import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ConvexStatus } from "./ConvexStatus";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-sm font-medium text-amber-300">3:11 Security</p>
          <h1 className="text-xl font-semibold">Super Admin</h1>
        </div>
        <Show when="signed-in">
          <div className="flex items-center gap-3">
            <ConvexStatus />
            <UserButton />
          </div>
        </Show>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-amber-300">
            Platform Control
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Manage regions, administrators, and platform-level safety data.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-300">
            Sign in to continue setting up the super-admin workspace for the
            new React platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Show when="signed-out">
              <SignInButton>
                <button className="h-11 rounded-md bg-amber-300 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="h-11 rounded-md border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Create account
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <a
                className="inline-flex h-11 items-center rounded-md bg-amber-300 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200"
                href="/dashboard"
              >
                Open dashboard
              </a>
            </Show>
          </div>
        </section>
      </main>
    </div>
  );
}
