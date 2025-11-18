import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Activity, Clock } from "lucide-react";

const stats = [
  {
    title: "Active Contacts",
    value: "335",
    change: "+12.5%",
    trend: "up",
    period: "from last month",
    icon: Users,
  },
  {
    title: "Messages Sent",
    value: "1,284",
    change: "+8.2%",
    trend: "up",
    period: "from last week",
    icon: MessageSquare,
  },
  {
    title: "Response Rate",
    value: "81%",
    change: "+6.1%",
    trend: "up",
    period: "from last week",
    icon: Activity,
  },
  {
    title: "Pending Follow-ups",
    value: "23",
    change: "8 due today",
    trend: "neutral",
    period: "",
    icon: Clock,
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stat.trend === "neutral" ? "text-orange-500 font-medium" : "text-green-500 font-medium"}>
                {stat.change}
              </span>{" "}
              {stat.period}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}