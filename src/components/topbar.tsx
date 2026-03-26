"use client";

import { signOut, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

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
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
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
    </header>
  );
}
