import React from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Analytics() {
  return (
    <Layout 
      title="Analytics & Reports"
      subtitle="Analyze your sales performance"
    >
      <div data-testid="analytics-content">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Advanced analytics functionality is coming soon. You'll be able to view detailed reports, conversion analytics, and performance insights.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
