import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, UserPlus, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface QuickActionsProps {
  onAddLead?: () => void;
  onImportLeads?: () => void;
  onAddTeamMember?: () => void;
  onConfigureTargets?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddLead,
  onImportLeads,
  onAddTeamMember,
  onConfigureTargets
}) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const canManageTeam = ["admin", "supervisor"].includes(currentUser.role);

  return (
    <Card className="border border-border" data-testid="quick-actions">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
        
        <div className="space-y-3">
          <Button 
            onClick={onAddLead}
            className="w-full flex items-center space-x-3 p-4 justify-start"
            data-testid="button-add-lead"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add New Lead</span>
          </Button>
          
          {canManageTeam && (
            <>
              <Button 
                onClick={onImportLeads}
                variant="secondary" 
                className="w-full flex items-center space-x-3 p-4 justify-start"
                data-testid="button-import-leads"
              >
                <Upload className="w-4 h-4" />
                <span className="font-medium">Import Leads</span>
              </Button>
              
              <Button 
                onClick={onAddTeamMember}
                variant="secondary" 
                className="w-full flex items-center space-x-3 p-4 justify-start"
                data-testid="button-add-team-member"
              >
                <UserPlus className="w-4 h-4" />
                <span className="font-medium">Add Team Member</span>
              </Button>
              
              <Button 
                onClick={onConfigureTargets}
                variant="secondary" 
                className="w-full flex items-center space-x-3 p-4 justify-start"
                data-testid="button-configure-targets"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Configure Targets</span>
              </Button>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-4">System Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="text-sm font-medium text-green-600" data-testid="status-active-users">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Data Sync</span>
              <span className="text-sm font-medium text-green-600" data-testid="status-data-sync">
                Up to date
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Server Status</span>
              <span className="text-sm font-medium text-green-600" data-testid="status-server">
                Healthy
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
