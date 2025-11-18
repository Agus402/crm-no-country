"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Mon", whatsapp: 45, email: 22 },
  { day: "Tue", whatsapp: 52, email: 30 },
  { day: "Wed", whatsapp: 38, email: 18 },
  { day: "Thu", whatsapp: 60, email: 42 },
  { day: "Fri", whatsapp: 55, email: 35 },
  { day: "Sat", whatsapp: 28, email: 12 },
  { day: "Sun", whatsapp: 18, email: 8 },
]

const chartConfig = {
  whatsapp: {
    label: "WhatsApp",
    color: "#8b5cf6",
  },
  email: {
    label: "Email",
    color: "#f97316",
  },
} satisfies ChartConfig

export function CommunicationChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
        
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          className="text-xs text-muted-foreground"
        />

        <YAxis 
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          className="text-xs text-muted-foreground"
        />

        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="whatsapp" fill="var(--color-whatsapp)" radius={[4, 4, 0, 0]} barSize={40} />
        <Bar dataKey="email" fill="var(--color-email)" radius={[4, 4, 0, 0]} barSize={40} />
      </BarChart>
    </ChartContainer>
  )
}