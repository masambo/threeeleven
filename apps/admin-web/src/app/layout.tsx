import type { Metadata } from "next";
import { ProfileSync } from "@/components/profile-sync";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "3:11 Security - Command Center",
  description:
    "Community neighbourhood watch operations dashboard for 3:11 Security",
  icons: {
    apple: "/311logo.png",
    icon: [
      { url: "/311logo.png", type: "image/png" },
    ],
    shortcut: "/311logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        "--font-geist-mono":
          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", monospace',
        "--font-geist-sans":
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>
          <ProfileSync appType="admin-web" />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
