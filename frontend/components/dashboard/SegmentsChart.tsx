"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { leadStatsService } from "@/services/lead-stats-service";

// Configuración con client, NO converted
const chartConfig = {
  visitors: { label: "Contacts" },
  active: { label: "Active Leads", color: "#8b5cf6" },
  followup: { label: "Follow-up", color: "#f97316" },
  client: { label: "Client", color: "#10b981" }, 
  inactive: { label: "Inactive", color: "#94a3b8" }, // inactive
} satisfies ChartConfig;

export function SegmentsChart() {
  const [chartData, setChartData] = React.useState([
    { segment: "active", visitors: 0, fill: "#8b5cf6" },
    { segment: "followup", visitors: 0, fill: "#f97316" },
    { segment: "client", visitors: 0, fill: "#10b981" }, 
    { segment: "inactive", visitors: 0, fill: "#94a3b8" }, // inactive
  ]);

  React.useEffect(() => {
    async function loadStats() {
      const stats = await leadStatsService.getStageStats();

      setChartData([
        { segment: "active", visitors: stats.active, fill: chartConfig.active.color },
        { segment: "followup", visitors: stats.followup, fill: chartConfig.followup.color },
        { segment: "client", visitors: stats.client, fill: chartConfig.client.color },
        { segment: "inactive", visitors: stats.inactive, fill: chartConfig.inactive.color },
      ]);
    }

    loadStats();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="segment"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="mt-4 grid gap-2">
        {chartData.map((item) => {
          const configKey = item.segment as keyof typeof chartConfig;
          const label = chartConfig[configKey].label;

          return (
            <div key={item.segment} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-muted-foreground">{label}</span>
              </div>
              <span className="font-medium">{item.visitors}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
