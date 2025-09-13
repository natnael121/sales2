import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConversionFunnelData } from "../../types";

interface ConversionFunnelProps {
  data: ConversionFunnelData;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  const funnelSteps = [
    {
      label: "Leads Generated",
      value: data.leads,
      percentage: 100,
      color: "bg-blue-500"
    },
    {
      label: "Contacted",
      value: data.contacted,
      percentage: Math.round((data.contacted / data.leads) * 100),
      color: "bg-green-500"
    },
    {
      label: "Meetings Scheduled",
      value: data.meetings,
      percentage: Math.round((data.meetings / data.leads) * 100),
      color: "bg-amber-500"
    },
    {
      label: "Conversions",
      value: data.conversions,
      percentage: Math.round((data.conversions / data.leads) * 100),
      color: "bg-purple-500"
    }
  ];

  return (
    <Card className="border border-border" data-testid="conversion-funnel">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Conversion Funnel</h3>
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          {funnelSteps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
              data-testid={`funnel-step-${index}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 ${step.color} rounded`}></div>
                <span className="font-medium">{step.label}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold" data-testid={`funnel-value-${index}`}>
                  {step.value.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`funnel-percentage-${index}`}>
                  {step.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
