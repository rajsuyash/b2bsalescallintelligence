"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/stats-cards";
import { CallTable } from "@/components/call-table";
import { FilterBar, Filters } from "@/components/filter-bar";
import { Loader2, Plus } from "lucide-react";

interface Stats {
  totalCalls: number;
  orders: number;
  complaints: number;
  normalVisits: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    dateFrom: "",
    dateTo: "",
    outcome: "all",
    search: "",
  });

  const role = (session?.user as any)?.role ?? "rep";
  const isManager = role === "manager" || role === "admin";

  const buildQuery = useCallback((f: Filters) => {
    const params = new URLSearchParams();
    if (f.dateFrom) params.set("dateFrom", f.dateFrom);
    if (f.dateTo) params.set("dateTo", f.dateTo);
    if (f.outcome && f.outcome !== "all") params.set("outcome", f.outcome);
    if (f.search) params.set("search", f.search);
    return params.toString();
  }, []);

  const fetchData = useCallback(
    async (f: Filters) => {
      setLoading(true);
      try {
        const query = buildQuery(f);
        const [statsRes, callsRes] = await Promise.all([
          fetch(`/api/stats${query ? `?${query}` : ""}`),
          fetch(`/api/calls${query ? `?${query}` : ""}`),
        ]);
        const statsData = await statsRes.json();
        const callsData = await callsRes.json();
        setStats(statsData);
        setCalls(callsData.calls ?? []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {!isManager && (
          <Link href="/dashboard/record">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record New Call
            </Button>
          </Link>
        )}
      </div>

      {isManager && (
        <FilterBar filters={filters} onFiltersChange={setFilters} />
      )}

      {stats && <StatsCards stats={stats} />}

      <CallTable calls={calls} />
    </div>
  );
}
