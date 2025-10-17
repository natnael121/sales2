import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Calendar, Users, Phone, MapPin, DollarSign, TrendingUp, Target, Clock, Award, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLeads, useCalls, useOrganizationMeetings } from "../hooks/useFirestore";
import { getUsersByOrganization } from "../lib/firestore";
import type { User, Lead, Call, Meeting, UserRole } from "../types";

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Analytics() {
  const { currentUser } = useAuth();
  const { leads, loading: leadsLoading } = useLeads(currentUser?.organizationId || "");
  const { calls, loading: callsLoading } = useCalls(currentUser?.organizationId || "");
  const { meetings, loading: meetingsLoading } = useOrganizationMeetings(currentUser?.organizationId || "");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser?.organizationId) {
        try {
          const orgUsers = await getUsersByOrganization(currentUser.organizationId);
          setUsers(orgUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setUsersLoading(false);
        }
      }
    };
    fetchUsers();
  }, [currentUser?.organizationId]);

  // Compute overall loading state
  const isLoading = leadsLoading || callsLoading || meetingsLoading || usersLoading;

  // Helper function to filter data by period
  const filterByPeriod = <T extends { createdAt: Date | string }>(data: T[], period: string): T[] => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return data.filter(item => {
      // Ensure createdAt is a Date object
      const itemDate = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
      return itemDate >= startDate;
    });
  };

  // Filter data based on user role and selected period
  const getFilteredData = () => {
    if (!currentUser) return { leads: [], calls: [], meetings: [], users: [] };
    
    // First, normalize dates to ensure they are Date objects
    const normalizeLeads = leads.map(lead => ({
      ...lead,
      createdAt: lead.createdAt instanceof Date ? lead.createdAt : new Date(lead.createdAt)
    }));
    
    const normalizeCalls = calls.map(call => ({
      ...call,
      createdAt: call.createdAt instanceof Date ? call.createdAt : new Date(call.createdAt)
    }));
    
    const normalizeMeetings = meetings.map(meeting => ({
      ...meeting,
      createdAt: meeting.createdAt instanceof Date ? meeting.createdAt : new Date(meeting.createdAt)
    }));
    
    // Apply period filtering
    const periodFilteredLeads = filterByPeriod(normalizeLeads, selectedPeriod);
    const periodFilteredCalls = filterByPeriod(normalizeCalls, selectedPeriod);
    const periodFilteredMeetings = filterByPeriod(normalizeMeetings, selectedPeriod);
    
    // Then apply role-based filtering
    switch (currentUser.role) {
      case "admin":
        return { 
          leads: periodFilteredLeads, 
          calls: periodFilteredCalls, 
          meetings: periodFilteredMeetings, 
          users 
        };
      case "supervisor":
        const supervisedUsers = users.filter(u => u.supervisorId === currentUser.uid);
        const supervisedUserIds = supervisedUsers.map(u => u.id);
        return {
          leads: periodFilteredLeads.filter(l => l.assignedToId && supervisedUserIds.includes(l.assignedToId)),
          calls: periodFilteredCalls.filter((c: Call) => supervisedUserIds.includes(c.agentId)),
          meetings: periodFilteredMeetings.filter((m: Meeting) => supervisedUserIds.includes(m.agentId)),
          users: supervisedUsers
        };
      case "call-center":
      case "field-agent":
        return {
          leads: periodFilteredLeads.filter(l => l.assignedToId === currentUser.uid),
          calls: periodFilteredCalls.filter((c: Call) => c.agentId === currentUser.uid),
          meetings: periodFilteredMeetings.filter((m: Meeting) => m.agentId === currentUser.uid || m.fieldAgentId === currentUser.uid),
          users: [users.find(u => u.id === currentUser.uid)].filter(Boolean) as User[]
        };
      default:
        return { leads: [], calls: [], meetings: [], users: [] };
    }
  };

  const { leads: filteredLeads, calls: filteredCalls, meetings: filteredMeetings, users: filteredUsers } = getFilteredData();

  // Generate analytics data
  const getAnalyticsData = () => {
    // Lead status distribution
    const leadStatusData = [
      { name: 'New', value: filteredLeads.filter(l => l.status === 'new').length, color: COLORS[0] },
      { name: 'Contacted', value: filteredLeads.filter(l => l.status === 'contacted').length, color: COLORS[1] },
      { name: 'Interested', value: filteredLeads.filter(l => l.status === 'interested').length, color: COLORS[2] },
      { name: 'Meeting', value: filteredLeads.filter(l => l.status === 'meeting').length, color: COLORS[3] },
      { name: 'Converted', value: filteredLeads.filter(l => l.status === 'converted').length, color: COLORS[4] },
      { name: 'Closed', value: filteredLeads.filter(l => l.status === 'closed').length, color: COLORS[5] }
    ].filter(item => item.value > 0);

    // Call outcome distribution
    const callOutcomeData = [
      { name: 'Interested', value: filteredCalls.filter((c: Call) => c.outcome === 'picked-interested').length },
      { name: 'Not Interested', value: filteredCalls.filter((c: Call) => c.outcome === 'picked-not-interested').length },
      { name: 'Meeting Setup', value: filteredCalls.filter((c: Call) => c.outcome === 'picked-meeting-setup').length },
      { name: 'Call Later', value: filteredCalls.filter((c: Call) => c.outcome === 'picked-call-later').length },
      { name: 'No Answer', value: filteredCalls.filter((c: Call) => c.outcome.includes('not-picked')).length }
    ].filter(item => item.value > 0);

    // Performance metrics over time based on selected period
    const getDaysInPeriod = (period: string) => {
      switch (period) {
        case "7d": return 7;
        case "30d": return 30;
        case "90d": return 90;
        default: return 7;
      }
    };

    const daysCount = getDaysInPeriod(selectedPeriod);
    const periodDates = Array.from({ length: daysCount }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const performanceData = periodDates.map(date => {
      const dayLeads = filteredLeads.filter(l => {
        const leadDate = l.createdAt instanceof Date ? l.createdAt : new Date(l.createdAt);
        return leadDate.toISOString().split('T')[0] === date;
      }).length;
      const dayCalls = filteredCalls.filter((c: Call) => {
        const callDate = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
        return callDate.toISOString().split('T')[0] === date;
      }).length;
      const dayMeetings = filteredMeetings.filter(m => {
        const meetingDate = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt);
        return meetingDate.toISOString().split('T')[0] === date;
      }).length;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        leads: dayLeads,
        calls: dayCalls,
        meetings: dayMeetings
      };
    });

    return { leadStatusData, callOutcomeData, performanceData };
  };

  const { leadStatusData, callOutcomeData, performanceData } = getAnalyticsData();

  // Calculate key metrics
  const totalLeads = filteredLeads.length;
  const totalCalls = filteredCalls.length;
  const totalMeetings = filteredMeetings.length;
  const conversions = filteredLeads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;
  const callToMeetingRate = totalCalls > 0 ? (filteredCalls.filter((c: Call) => c.outcome === 'picked-meeting-setup').length / totalCalls) * 100 : 0;
  const meetingToConversionRate = totalMeetings > 0 ? (conversions / totalMeetings) * 100 : 0;

  const getTitle = () => {
    switch (currentUser?.role) {
      case "admin": return "Organization Analytics";
      case "supervisor": return "Team Performance Analytics";
      case "call-center": return "Call Center Analytics";
      case "field-agent": return "Field Agent Analytics";
      default: return "Analytics & Reports";
    }
  };

  const getSubtitle = () => {
    switch (currentUser?.role) {
      case "admin": return "Comprehensive organizational performance insights";
      case "supervisor": return "Monitor and analyze your team's performance";
      case "call-center": return "Track your calling performance and lead conversion";
      case "field-agent": return "Monitor your field activities and meeting outcomes";
      default: return "Analyze your sales performance";
    }
  };

  if (isLoading || !currentUser) {
    return (
      <Layout title="Analytics & Reports" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">
            {!currentUser ? "Loading user data..." : "Loading analytics data..."}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {leadsLoading && "Loading leads... "}
            {callsLoading && "Loading calls... "}
            {meetingsLoading && "Loading meetings... "}
            {usersLoading && "Loading users... "}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={getTitle()} subtitle={getSubtitle()}>
      <div data-testid="analytics-content" className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Performance Dashboard</h2>
            <p className="text-muted-foreground">Real-time insights and analytics</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-3xl font-bold">{totalLeads}</p>
                  <p className="text-xs text-green-600 mt-1">+{Math.floor(totalLeads * 0.12)} this week</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
                  <Progress value={conversionRate} className="mt-2" />
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                  <p className="text-3xl font-bold">{totalCalls}</p>
                  <p className="text-xs text-blue-600 mt-1">{callToMeetingRate.toFixed(1)}% to meeting</p>
                </div>
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meetings</p>
                  <p className="text-3xl font-bold">{totalMeetings}</p>
                  <p className="text-xs text-orange-600 mt-1">{meetingToConversionRate.toFixed(1)}% converted</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
            {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
              <TabsTrigger value="team">Team Analytics</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {leadStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Call Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle>Call Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={callOutcomeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="leads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="calls" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="meetings" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="conversion" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
                  <div className="text-sm text-muted-foreground">Total Leads</div>
                  <div className="mt-2 text-xs">100%</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredLeads.filter(l => ['contacted', 'interested', 'meeting', 'converted'].includes(l.status)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Contacted</div>
                  <div className="mt-2 text-xs">
                    {totalLeads > 0 ? ((filteredLeads.filter(l => ['contacted', 'interested', 'meeting', 'converted'].includes(l.status)).length / totalLeads) * 100).toFixed(1) : 0}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">{totalMeetings}</div>
                  <div className="text-sm text-muted-foreground">Meetings</div>
                  <div className="mt-2 text-xs">
                    {totalLeads > 0 ? ((totalMeetings / totalLeads) * 100).toFixed(1) : 0}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600">{conversions}</div>
                  <div className="text-sm text-muted-foreground">Conversions</div>
                  <div className="mt-2 text-xs">{conversionRate.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((user) => {
                      const userLeads = filteredLeads.filter(l => l.assignedToId === user.id);
                      const userCalls = filteredCalls.filter(c => c.agentId === user.id);
                      const userMeetings = filteredMeetings.filter(m => m.agentId === user.id);
                      const userConversions = userLeads.filter(l => l.status === 'converted').length;
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-foreground">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                <Badge variant="outline">{user.role}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold">{userLeads.length}</div>
                              <div className="text-xs text-muted-foreground">Leads</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold">{userCalls.length}</div>
                              <div className="text-xs text-muted-foreground">Calls</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold">{userMeetings.length}</div>
                              <div className="text-xs text-muted-foreground">Meetings</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold">{userConversions}</div>
                              <div className="text-xs text-muted-foreground">Conversions</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
