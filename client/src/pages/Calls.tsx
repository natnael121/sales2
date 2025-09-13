import React from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Calls() {
  return (
    <Layout 
      title="Call Management"
      subtitle="Track and manage your call activities"
      quickActionLabel="Log Call"
    >
      <div data-testid="calls-content">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Call Management</h3>
            <p className="text-muted-foreground">
              Call management functionality is coming soon. You'll be able to log calls, track outcomes, and schedule callbacks.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
