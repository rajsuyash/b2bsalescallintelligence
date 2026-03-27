"use client";

import { signOut, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Search, Bell } from "lucide-react";

const roleBadgeColor: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  rep: "bg-green-100 text-green-700",
};

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search calls..."
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="text-slate-400 hover:text-primary transition-colors hidden sm:block">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-l pl-4 sm:pl-6 border-slate-200">
          {user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.teamName}</p>
              </div>
              <Badge className={roleBadgeColor[user.role] ?? ""} variant="secondary">
                {user.role}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
