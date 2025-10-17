import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { RecentActivityItem } from "../../types";

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityColor = (type: string) => {
    switch (type) {
      case "call": return "bg-blue-500";
      case "meeting": return "bg-green-500";
      case "conversion": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "call": return "secondary";
      case "meeting": return "default";
      case "conversion": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card className="lg:col-span-2 border border-border" data-testid="recent-activity">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Lead Activity</h3>
          <Button variant="link" className="text-sm text-primary hover:underline p-0">
            View All Leads
          </Button>
        </div>
        
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="activity-empty">
              No recent activity
            </div>
          ) : (
            activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg transition-colors"
                data-testid={`activity-${index}`}
              >
                <div 
                  className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2 flex-shrink-0`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium" data-testid={`activity-agent-${index}`}>
                      {activity.agentName}
                    </span>
                    <span className="text-muted-foreground"> {activity.action} </span>
                    <span className="font-medium" data-testid={`activity-lead-${index}`}>
                      {activity.leadName}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1" data-testid={`activity-time-${index}`}>
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <Badge 
                  variant={getBadgeVariant(activity.type)} 
                  className="capitalize"
                  data-testid={`activity-badge-${index}`}
                >
                  {activity.type}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
