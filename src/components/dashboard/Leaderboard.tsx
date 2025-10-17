import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TopPerformer } from "../../types";

interface LeaderboardProps {
  performers: TopPerformer[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ performers }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-600";
      case "supervisor": return "bg-blue-600";
      case "call-center": return "bg-green-600";
      case "field-agent": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <Card className="border border-border" data-testid="leaderboard">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
          <Button variant="link" className="text-sm text-primary hover:underline p-0">
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {performers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="leaderboard-empty">
              No performance data available
            </div>
          ) : (
            performers.map((performer, index) => (
              <div 
                key={performer.id} 
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
                data-testid={`performer-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getRoleColor(performer.role)} rounded-full flex items-center justify-center`}>
                    <span className="text-sm font-medium text-white">
                      {getInitials(performer.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground" data-testid={`performer-name-${index}`}>
                      {performer.name}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize" data-testid={`performer-role-${index}`}>
                      {performer.role.replace("-", " ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground" data-testid={`performer-conversions-${index}`}>
                    {performer.conversions} conversions
                  </p>
                  <p className="text-sm text-green-600" data-testid={`performer-growth-${index}`}>
                    {performer.growth > 0 ? '+' : ''}{performer.growth}% this month
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
