"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { week: "Week 1", rate: 68 },
  { week: "Week 2", rate: 72 },
  { week: "Week 3", rate: 76 },
  { week: "Week 4", rate: 82 },
]

const chartConfig = {
  rate: {
    label: "Response Rate",
    color: "#8b5cf6",
  },
} satisfies ChartConfig

export function ResponseTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{right: 12, bottom: 10 }} 
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
        
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs text-muted-foreground"
        />

        <YAxis 
          tickLine={false}
          axisLine={false}
          tickMargin={10} 
          domain={[0, 100]} 
          ticks={[0, 25, 50, 75, 100]} 
          className="text-xs text-muted-foreground"
        />

        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        
        <Line
          dataKey="rate"
          type="linear"
          stroke="var(--color-rate)"
          strokeWidth={2}
          dot={{ fill: "var(--color-rate)", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}