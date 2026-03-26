import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShoppingCart, AlertTriangle, MapPin } from "lucide-react";

interface OutcomeBadgeProps {
  outcome: string;
  className?: string;
}

const outcomeConfig: Record<string, { style: string; icon: React.ElementType }> = {
  Order: {
    style: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: ShoppingCart,
  },
  Complaint: {
    style: "bg-red-100 text-red-800 hover:bg-red-100",
    icon: AlertTriangle,
  },
  "Normal Visit": {
    style: "bg-slate-100 text-slate-800 hover:bg-slate-100",
    icon: MapPin,
  },
};

export function OutcomeBadge({ outcome, className }: OutcomeBadgeProps) {
  const config = outcomeConfig[outcome];
  const style = config?.style ?? "bg-slate-100 text-slate-800 hover:bg-slate-100";
  const Icon = config?.icon;

  return (
    <Badge variant="secondary" className={cn(style, "inline-flex items-center", className)}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {outcome}
    </Badge>
  );
}
