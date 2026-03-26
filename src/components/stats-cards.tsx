import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, ShoppingCart, AlertTriangle, MapPin } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalCalls: number;
    orders: number;
    complaints: number;
    normalVisits: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Calls",
      value: stats.totalCalls,
      icon: Phone,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Complaints",
      value: stats.complaints,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Normal Visits",
      value: stats.normalVisits,
      icon: MapPin,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2.5 rounded-lg ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
