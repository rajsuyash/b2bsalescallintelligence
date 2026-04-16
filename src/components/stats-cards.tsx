import { Phone, ShoppingCart, AlertTriangle, MapPin, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalCalls: number;
    orders: number;
    complaints: number;
    normalVisits: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const conversionRate = stats.totalCalls > 0
    ? Math.round((stats.orders / stats.totalCalls) * 100)
    : 0;

  const cards = [
    {
      title: "Total Calls",
      value: stats.totalCalls.toString(),
      icon: Phone,
      color: "text-primary",
      bg: "bg-primary/10",
      subtitle: null,
    },
    {
      title: "Orders",
      value: stats.orders.toString(),
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-50",
      subtitle: `${conversionRate}% conversion`,
    },
    {
      title: "Complaints",
      value: stats.complaints.toString(),
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-red-50",
      subtitle: stats.complaints > 0 ? "Needs attention" : "All clear",
    },
    {
      title: "Normal Visits",
      value: stats.normalVisits.toString(),
      icon: MapPin,
      color: "text-slate-600",
      bg: "bg-slate-100",
      subtitle: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              {card.title}
            </p>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-headline font-extrabold text-slate-900 tracking-tighter">
            {card.value}
          </p>
          {card.subtitle && (
            <p className={`text-xs mt-1 font-medium ${card.color}`}>
              {card.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
