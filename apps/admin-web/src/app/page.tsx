"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SplashPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const timer = window.setTimeout(() => {
      router.replace(isSignedIn ? "/dashboard" : "/sign-in");
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [isLoaded, isSignedIn, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-7 text-center">
        <div className="animate-pulse-soft relative h-28 w-28">
          <Image
            alt="3:11 Security"
            className="object-contain"
            fill
            priority
            src="/311logo.png"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            3:11<span className="ml-1 text-blue-600">Security</span>
          </h1>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
            Command Center
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          Connecting&hellip;
        </div>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .animate-pulse-soft { animation: pulse-soft 1.6s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
