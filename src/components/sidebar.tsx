"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Mic, Phone, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["rep", "manager", "admin"] },
  { href: "/dashboard/record", label: "Record Call", icon: Mic, roles: ["rep"] },
  { href: "/dashboard/calls", label: "All Calls", icon: Phone, roles: ["manager", "admin"] },
  { href: "/dashboard/team", label: "Team", icon: Users, roles: ["admin"] },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "rep";

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-slate-700/50">
          <h1 className="text-lg font-bold">Sales Call Recorder</h1>
          <p className="text-xs text-slate-400 mt-1">Usha Martin Ltd.</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {filtered.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white border-l-2 border-blue-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
