"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
