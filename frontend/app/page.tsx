import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SegmentsChart } from "@/components/dashboard/SegmentsChart";
import { CommunicationChart } from "@/components/dashboard/CommunicationChart";
import { ResponseTrendChart } from "@/components/dashboard/ResponseTrendChart";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back! Here's what's happening with your contacts today.
          </p>
        </div>
      </div>

      {/* Stats Cards*/}
      <StatsCards />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        
        {/* Communication Activity */}
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Communication Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 md:pl-2"> 
            <CommunicationChart />
          </CardContent>
        </Card>

        {/* Response Rate Trend */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Response Rate Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-12 md:pt-24"> 
             <ResponseTrendChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
              <RecentActivity />
          </CardContent>
        </Card>

        {/* Contact Segments */}
        <Card className="lg:col-span-3 flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Contact Segments</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
             <SegmentsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}