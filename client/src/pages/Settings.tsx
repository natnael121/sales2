import React from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  return (
    <Layout 
      title="Settings"
      subtitle="Configure your system settings"
    >
      <div data-testid="settings-content">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">System Settings</h3>
            <p className="text-muted-foreground">
              Settings functionality is coming soon. You'll be able to configure targets, commission rules, and system preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
