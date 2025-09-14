import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { MetricsGrid } from "../components/dashboard/MetricsGrid";
import { ConversionFunnel } from "../components/dashboard/ConversionFunnel";
import { Leaderboard } from "../components/dashboard/Leaderboard";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { QuickActions } from "../components/dashboard/QuickActions";
import { ChatWidget } from "../components/chat/ChatWidget";
import { LeadModal } from "../components/leads/LeadModal";
import { useAuth } from "../hooks/useAuth";
import { useLeads } from "../hooks/useFirestore";
import { getUsersByOrganization } from "../lib/firestore";
import { useToast } from "../hooks/use-toast";
import type { 
  DashboardMetrics, 
  ConversionFunnelData, 
  TopPerformer, 
  RecentActivityItem,
  User,
  Lead 
} from "../types";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { leads, loading: leadsLoading } = useLeads(currentUser?.organizationId || "");
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    conversionRate: 0,
    activeAgents: 0,
    revenue: 0
  });
  const [funnelData, setFunnelData] = useState<ConversionFunnelData>({
    leads: 0,
    contacted: 0,
    meetings: 0,
    conversions: 0
  });
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // LeadModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser?.organizationId) {
        try {
          const orgUsers = await getUsersByOrganization(currentUser.organizationId);
          setUsers(orgUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    fetchUsers();
  }, [currentUser?.organizationId]);

  useEffect(() => {
    if (!leadsLoading && leads.length > 0) {
      // Calculate metrics
      const totalLeads = leads.length;
      const contactedLeads = leads.filter(lead => 
        ["contacted", "interested", "meeting", "converted"].includes(lead.status)
      ).length;
      const convertedLeads = leads.filter(lead => lead.status === "converted").length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const activeAgents = users.filter(user => user.isActive).length;
      
      setMetrics({
        totalLeads,
        conversionRate,
        activeAgents,
        revenue: convertedLeads * 5000 // Estimated revenue per conversion
      });

      // Calculate funnel data
      const meetingLeads = leads.filter(lead => 
        ["meeting", "converted"].includes(lead.status)
      ).length;

      setFunnelData({
        leads: totalLeads,
        contacted: contactedLeads,
        meetings: meetingLeads,
        conversions: convertedLeads
      });

      // Generate sample top performers (in a real app, this would come from aggregated data)
      const performers: TopPerformer[] = users
        .filter(user => ["call-center", "field-agent", "supervisor"].includes(user.role))
        .slice(0, 3)
        .map((user, index) => ({
          id: user.id,
          name: user.name,
          role: user.role,
          conversions: Math.floor(Math.random() * 50) + 20,
          growth: Math.floor(Math.random() * 30) + 5
        }));

      setTopPerformers(performers);

      // Generate sample recent activity
      const activities: RecentActivityItem[] = leads
        .slice(0, 5)
        .map((lead, index) => ({
          id: `activity-${index}`,
          type: ["call", "meeting", "conversion"][Math.floor(Math.random() * 3)] as any,
          agentName: users[Math.floor(Math.random() * users.length)]?.name || "Unknown Agent",
          leadName: lead.name,
          action: "contacted",
          timestamp: new Date(Date.now() - Math.random() * 86400000) // Random time in last 24h
        }));

      setRecentActivity(activities);
    }
  }, [leads, leadsLoading, users]);

  const getDashboardTitle = () => {
    if (!currentUser) return "Dashboard";
    
    switch (currentUser.role) {
      case "admin":
        return "Admin Dashboard";
      case "supervisor":
        return "Supervisor Dashboard";
      case "call-center":
        return "Call Center Dashboard";
      case "field-agent":
        return "Field Agent Dashboard";
      default:
        return "Dashboard";
    }
  };

  const getDashboardSubtitle = () => {
    if (!currentUser) return "";
    
    switch (currentUser.role) {
      case "admin":
        return "Manage your sales organization";
      case "supervisor":
        return "Monitor team performance and approve leads";
      case "call-center":
        return "Manage assigned leads and schedule meetings";
      case "field-agent":
        return "View meetings and manage field visits";
      default:
        return "";
    }
  };

  // Quick Action handlers
  const handleAddLead = () => {
    setSelectedLead(undefined);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleImportLeads = () => {
    // TODO: Implement lead import functionality
    toast({
      title: "Coming Soon",
      description: "Lead import functionality will be available soon.",
    });
  };

  const handleAddTeamMember = () => {
    // TODO: Implement add team member functionality
    toast({
      title: "Coming Soon",
      description: "Add team member functionality will be available soon.",
    });
  };

  const handleConfigureTargets = () => {
    // TODO: Implement configure targets functionality
    toast({
      title: "Coming Soon",
      description: "Configure targets functionality will be available soon.",
    });
  };

  if (!currentUser) return null;

  return (
    <>
      <Layout 
        title={getDashboardTitle()}
        subtitle={getDashboardSubtitle()}
        quickActionLabel="Add Lead"
      >
        <div data-testid="dashboard-content">
          <MetricsGrid metrics={metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ConversionFunnel data={funnelData} />
            <Leaderboard performers={topPerformers} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentActivity activities={recentActivity} />
            <QuickActions 
              onAddLead={handleAddLead}
              onImportLeads={handleImportLeads}
              onAddTeamMember={handleAddTeamMember}
              onConfigureTargets={handleConfigureTargets}
            />
          </div>
        </div>
      </Layout>
      <ChatWidget />
      <LeadModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        agents={users.filter(user => ["call-center", "field-agent", "supervisor"].includes(user.role))}
        mode={modalMode}
        lead={selectedLead}
      />
    </>
  );
}
