"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OutcomeBadge } from "@/components/outcome-badge";
import { Eye, Clock, User } from "lucide-react";

interface Call {
  id: string;
  createdAt: string;
  duration: number;
  outcomeLabel: string;
  user: { name: string };
  customer: { company: string };
}

interface CallTableProps {
  calls: Call[];
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function CallTable({ calls }: CallTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Rep</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No calls found.
                </TableCell>
              </TableRow>
            ) : (
              calls.map((call) => (
                <TableRow key={call.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    {format(new Date(call.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{call.user.name}</TableCell>
                  <TableCell>{call.customer.company}</TableCell>
                  <TableCell>{formatDuration(call.duration)}</TableCell>
                  <TableCell>
                    <OutcomeBadge outcome={call.outcomeLabel} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/calls/${call.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No calls found.
          </div>
        ) : (
          calls.map((call) => (
            <Link key={call.id} href={`/dashboard/calls/${call.id}`}>
              <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">
                    {call.customer.company}
                  </span>
                  <OutcomeBadge outcome={call.outcomeLabel} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{format(new Date(call.createdAt), "MMM d, yyyy")}</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {call.user.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(call.duration)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
