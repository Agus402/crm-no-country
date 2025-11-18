"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Datos Mockeados 
const chartData = [
  { segment: "active", visitors: 145, fill: "#8b5cf6" }, 
  { segment: "followup", visitors: 89, fill: "#f97316" }, 
  { segment: "converted", visitors: 67, fill: "#10b981" }, 
  { segment: "inactive", visitors: 34, fill: "#94a3b8" }, 
]

// Configuración de etiquetas y colores
const chartConfig = {
  visitors: {
    label: "Contacts",
  },
  active: {
    label: "Active Leads",
    color: "#8b5cf6",
  },
  followup: {
    label: "Follow-up",
    color: "#f97316",
  },
  converted: {
    label: "Converted",
    color: "#10b981",
  },
  inactive: {
    label: "Inactive",
    color: "#94a3b8",
  },
} satisfies ChartConfig

export function SegmentsChart() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Chart Section */}
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
           const label = chartConfig[configKey]?.label;
           
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
           )
        })}
      </div>
    </div>
  )
}