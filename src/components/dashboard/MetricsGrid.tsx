import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, UserCheck, DollarSign } from "lucide-react";
import type { DashboardMetrics } from "../../types";

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const metricCards = [
    {
      title: "Total Leads",
      value: metrics.totalLeads.toLocaleString(),
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      change: "+12.5%",
      changeLabel: "vs last month"
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      change: "+3.2%",
      changeLabel: "vs last month"
    },
    {
      title: "Active Agents",
      value: metrics.activeAgents.toString(),
      icon: UserCheck,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      change: "+5",
      changeLabel: "new this week"
    },
    {
      title: "Revenue",
      value: `$${(metrics.revenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      change: "+18.7%",
      changeLabel: "vs last month"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="metrics-grid">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className="border border-border" data-testid={`metric-card-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground" data-testid={`metric-value-${index}`}>
                    {metric.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-xl ${metric.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 font-medium" data-testid={`metric-change-${index}`}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground ml-2">
                  {metric.changeLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
