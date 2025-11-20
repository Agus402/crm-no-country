import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SegmentsChart } from "@/components/dashboard/SegmentsChart";
import { CommunicationChart } from "@/components/dashboard/CommunicationChart";
import { ResponseTrendChart } from "@/components/dashboard/ResponseTrendChart";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your contacts today.
          </p>
        </div>
      </div>
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Communication Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Communication Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <CommunicationChart />
          </CardContent>
        </Card>

        {/* Response Rate Trend */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Response Rate Trend</CardTitle>
          </CardHeader>
            <CardContent className="pt-24"> 
              <ResponseTrendChart />
          </CardContent>
        </Card>
      </div>

      {/*Recent Activity & Segments */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <RecentActivity />
          </CardContent>
        </Card>

        {/* Contact Segments */}
        <Card className="col-span-3 flex flex-col">
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