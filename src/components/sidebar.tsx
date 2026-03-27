"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Mic, Phone, Users, Plus } from "lucide-react";
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-8">
          <h1 className="text-2xl font-headline font-extrabold text-slate-900 tracking-tighter">
            SalesPulse
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 mt-1">
            Usha Martin Ltd.
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {filtered.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "text-blue-700 bg-slate-200/50 border-r-4 border-blue-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* New Call CTA */}
        {role === "rep" && (
          <div className="p-6">
            <Link href="/dashboard/record" onClick={onClose}>
              <button className="w-full py-4 bg-primary text-white rounded-full font-headline font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                New Call
              </button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
