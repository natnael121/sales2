import React from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Meetings() {
  return (
    <Layout 
      title="Meeting Schedule"
      subtitle="Manage your meetings and field visits"
      quickActionLabel="Schedule Meeting"
    >
      <div data-testid="meetings-content">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Meeting Management</h3>
            <p className="text-muted-foreground">
              Meeting management functionality is coming soon. You'll be able to schedule meetings, track field visits, and log meeting outcomes.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
