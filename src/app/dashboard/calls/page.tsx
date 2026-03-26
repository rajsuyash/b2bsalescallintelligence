"use client";

import { useEffect, useState, useCallback } from "react";
import { CallTable } from "@/components/call-table";
import { FilterBar, Filters } from "@/components/filter-bar";
import { Loader2 } from "lucide-react";

export default function AllCallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    dateFrom: "",
    dateTo: "",
    outcome: "all",
    search: "",
  });

  const fetchCalls = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.dateFrom) params.set("dateFrom", f.dateFrom);
      if (f.dateTo) params.set("dateTo", f.dateTo);
      if (f.outcome && f.outcome !== "all") params.set("outcome", f.outcome);
      if (f.search) params.set("search", f.search);

      const query = params.toString();
      const res = await fetch(`/api/calls${query ? `?${query}` : ""}`);
      const data = await res.json();
      setCalls(data.calls ?? []);
    } catch (error) {
      console.error("Failed to fetch calls:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls(filters);
  }, [fetchCalls, filters]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Calls</h1>

      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CallTable calls={calls} />
      )}
    </div>
  );
}
