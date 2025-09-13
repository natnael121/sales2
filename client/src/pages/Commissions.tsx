import React from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Commissions() {
  return (
    <Layout 
      title="Commissions & Rewards"
      subtitle="Track your earnings and rewards"
    >
      <div data-testid="commissions-content">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Commission Tracking</h3>
            <p className="text-muted-foreground">
              Commission tracking functionality is coming soon. You'll be able to view your earned commissions, pending payouts, and reward history.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
