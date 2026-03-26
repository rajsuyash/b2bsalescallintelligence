"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Filters {
  dateFrom: string;
  dateTo: string;
  outcome: string;
  search: string;
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3">
      {/* Mobile toggle */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 sm:hidden"
      >
        <Filter className="h-4 w-4" />
        Filters
        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
      </button>

      <div className={cn(
        "flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4",
        !expanded && "hidden sm:flex"
      )}>
        {/* Date from */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="text-sm font-medium text-muted-foreground">
            From
          </label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="w-full sm:w-40"
          />
        </div>

        {/* Date to */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="text-sm font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="w-full sm:w-40"
          />
        </div>

        {/* Outcome select */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="text-sm font-medium text-muted-foreground">
            Outcome
          </label>
          <Select
            value={filters.outcome}
            onValueChange={(val) => update("outcome", val ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Order">Order</SelectItem>
              <SelectItem value="Complaint">Complaint</SelectItem>
              <SelectItem value="Normal Visit">Normal Visit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search input */}
        <div className="space-y-1 w-full sm:flex-1 sm:min-w-[200px]">
          <label className="text-sm font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by customer name..."
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
