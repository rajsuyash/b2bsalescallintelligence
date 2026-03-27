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
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Complaints",
      value: stats.complaints,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-red-50",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              {card.title}
            </p>
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-3xl font-headline font-extrabold text-slate-900 tracking-tighter">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
