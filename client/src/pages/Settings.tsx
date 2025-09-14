import React, { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { createLead } from "../lib/firestore";
import { parseExcelFile, createSampleExcelFile } from "../lib/excel-import";
import { ImportResultsModal } from "../components/settings/ImportResultsModal";
import type { ImportResult } from "../lib/excel-import";
import { 
  Settings as SettingsIcon, 
  Users, 
  Target, 
  DollarSign, 
  Bell, 
  Upload, 
  Download,
  MessageSquare,
  Shield,
  Globe,
  Database,
  Zap
} from "lucide-react";

export default function Settings() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Organization Settings
  const [orgSettings, setOrgSettings] = useState({
    companyName: "Acme Sales Corp",
    timezone: "UTC-05:00",
    currency: "USD",
    workingHours: "9:00-17:00",
    defaultLeadStatus: "new" as const,
    autoAssignLeads: true,
    enableNotifications: true,
    allowSelfRegistration: false
  });

  // Target Settings
  const [targetSettings, setTargetSettings] = useState({
    monthlyLeadTarget: 100,
    monthlyConversionTarget: 25,
    monthlyRevenueTarget: 50000,
    targetResetDay: 1,
    enableTargetNotifications: true
  });

  // Commission Settings
  const [commissionSettings, setCommissionSettings] = useState({
    meetingCommission: 50,
    conversionCommission: 200,
    purchaseCommissionRate: 5, // percentage
    bonusThreshold: 10,
    bonusAmount: 500,
    autoApproveCommissions: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true,
    newLeadAlerts: true,
    meetingReminders: true,
    targetAlerts: true
  });

  // Chat Settings
  const [chatSettings, setChatSettings] = useState({
    enableChat: true,
    rocketChatServer: "https://your-server.rocket.chat",
    enableFileSharing: true,
    maxFileSize: 10, // MB
    retentionPeriod: 90, // days
    enablePushNotifications: true
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    enableDataExport: true,
    enableBulkImport: true,
    sessionTimeout: 8, // hours
    enableAuditLog: true,
    backupFrequency: "daily" as const,
    enableMaintenance: false
  });

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      // TODO: Implement actual save functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Saved",
        description: `${section} settings have been updated successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeadImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && currentUser?.organizationId) {
        setLoading(true);
        try {
          toast({
            title: "Processing File",
            description: `Parsing ${file.name}...`,
          });
          
          const result = await parseExcelFile(file, currentUser.organizationId);
          setImportResult(result);
          setShowImportModal(true);
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to parse Excel file. Please check the format.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const handleDownloadTemplate = () => {
    try {
      createSampleExcelFile();
      toast({
        title: "Template Downloaded",
        description: "Sample Excel template has been downloaded to your computer.",
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult || !currentUser?.organizationId) return;

    setImportLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const leadData of importResult.validLeads) {
        try {
          await createLead(leadData);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error creating lead:', error);
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} leads. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

      setShowImportModal(false);
      setImportResult(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import leads. Please try again.",
        variant: "destructive"
      });
    } finally {
      setImportLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <Layout title="Settings" subtitle="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
            <p className="text-muted-foreground">
              You need administrator privileges to access system settings.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout 
      title="System Settings"
      subtitle="Configure all aspects of your sales management system"
    >
      <div data-testid="settings-content" className="space-y-6">
        <Tabs defaultValue="organization" className="w-full">
          <TabsList className="grid grid-cols-6 w-full mb-6">
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="targets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Targets</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Commissions</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Settings */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Organization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={orgSettings.companyName}
                      onChange={(e) => setOrgSettings({...orgSettings, companyName: e.target.value})}
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={orgSettings.timezone} onValueChange={(value) => setOrgSettings({...orgSettings, timezone: value})}>
                      <SelectTrigger data-testid="select-timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-05:00">EST (UTC-5)</SelectItem>
                        <SelectItem value="UTC-06:00">CST (UTC-6)</SelectItem>
                        <SelectItem value="UTC-07:00">MST (UTC-7)</SelectItem>
                        <SelectItem value="UTC-08:00">PST (UTC-8)</SelectItem>
                        <SelectItem value="UTC+00:00">UTC (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={orgSettings.currency} onValueChange={(value) => setOrgSettings({...orgSettings, currency: value})}>
                      <SelectTrigger data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <Input
                      id="workingHours"
                      value={orgSettings.workingHours}
                      onChange={(e) => setOrgSettings({...orgSettings, workingHours: e.target.value})}
                      placeholder="9:00-17:00"
                      data-testid="input-working-hours"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Lead Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Lead Status</Label>
                      <Select value={orgSettings.defaultLeadStatus} onValueChange={(value: any) => setOrgSettings({...orgSettings, defaultLeadStatus: value})}>
                        <SelectTrigger data-testid="select-default-lead-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between space-y-2">
                      <Label htmlFor="autoAssign">Auto-assign Leads</Label>
                      <Switch
                        id="autoAssign"
                        checked={orgSettings.autoAssignLeads}
                        onCheckedChange={(checked) => setOrgSettings({...orgSettings, autoAssignLeads: checked})}
                        data-testid="switch-auto-assign"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Data Management</h4>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={handleLeadImport} 
                        className="flex items-center gap-2"
                        disabled={loading}
                        data-testid="button-import-leads"
                      >
                        <Upload className="h-4 w-4" />
                        {loading ? "Processing..." : "Import Leads from Excel"}
                      </Button>
                      <Button 
                        onClick={handleDownloadTemplate}
                        variant="outline" 
                        className="flex items-center gap-2"
                        data-testid="button-download-template"
                      >
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        data-testid="button-export-leads"
                      >
                        <Download className="h-4 w-4" />
                        Export All Data
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>• Supported formats: Excel (.xlsx, .xls) and CSV (.csv)</p>
                      <p>• Required column: Name</p>
                      <p>• Optional columns: Email, Phone, Company, Estimated Value, Status, Source, Notes</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('Organization')}
                    disabled={loading}
                    data-testid="button-save-organization"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Target Settings */}
          <TabsContent value="targets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Target & Goal Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="leadTarget">Monthly Lead Target</Label>
                    <Input
                      id="leadTarget"
                      type="number"
                      value={targetSettings.monthlyLeadTarget}
                      onChange={(e) => setTargetSettings({...targetSettings, monthlyLeadTarget: parseInt(e.target.value) || 0})}
                      data-testid="input-lead-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversionTarget">Monthly Conversion Target</Label>
                    <Input
                      id="conversionTarget"
                      type="number"
                      value={targetSettings.monthlyConversionTarget}
                      onChange={(e) => setTargetSettings({...targetSettings, monthlyConversionTarget: parseInt(e.target.value) || 0})}
                      data-testid="input-conversion-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revenueTarget">Monthly Revenue Target ($)</Label>
                    <Input
                      id="revenueTarget"
                      type="number"
                      value={targetSettings.monthlyRevenueTarget}
                      onChange={(e) => setTargetSettings({...targetSettings, monthlyRevenueTarget: parseInt(e.target.value) || 0})}
                      data-testid="input-revenue-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resetDay">Target Reset Day</Label>
                    <Input
                      id="resetDay"
                      type="number"
                      min="1"
                      max="31"
                      value={targetSettings.targetResetDay}
                      onChange={(e) => setTargetSettings({...targetSettings, targetResetDay: parseInt(e.target.value) || 1})}
                      data-testid="input-reset-day"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="targetNotifications">Enable Target Notifications</Label>
                  <Switch
                    id="targetNotifications"
                    checked={targetSettings.enableTargetNotifications}
                    onCheckedChange={(checked) => setTargetSettings({...targetSettings, enableTargetNotifications: checked})}
                    data-testid="switch-target-notifications"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('Targets')}
                    disabled={loading}
                    data-testid="button-save-targets"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Settings */}
          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Commission & Reward Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="meetingCommission">Meeting Commission ($)</Label>
                    <Input
                      id="meetingCommission"
                      type="number"
                      value={commissionSettings.meetingCommission}
                      onChange={(e) => setCommissionSettings({...commissionSettings, meetingCommission: parseInt(e.target.value) || 0})}
                      data-testid="input-meeting-commission"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversionCommission">Conversion Commission ($)</Label>
                    <Input
                      id="conversionCommission"
                      type="number"
                      value={commissionSettings.conversionCommission}
                      onChange={(e) => setCommissionSettings({...commissionSettings, conversionCommission: parseInt(e.target.value) || 0})}
                      data-testid="input-conversion-commission"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseRate">Purchase Commission Rate (%)</Label>
                    <Input
                      id="purchaseRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={commissionSettings.purchaseCommissionRate}
                      onChange={(e) => setCommissionSettings({...commissionSettings, purchaseCommissionRate: parseFloat(e.target.value) || 0})}
                      data-testid="input-purchase-rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonusThreshold">Bonus Threshold (conversions)</Label>
                    <Input
                      id="bonusThreshold"
                      type="number"
                      value={commissionSettings.bonusThreshold}
                      onChange={(e) => setCommissionSettings({...commissionSettings, bonusThreshold: parseInt(e.target.value) || 0})}
                      data-testid="input-bonus-threshold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonusAmount">Bonus Amount ($)</Label>
                    <Input
                      id="bonusAmount"
                      type="number"
                      value={commissionSettings.bonusAmount}
                      onChange={(e) => setCommissionSettings({...commissionSettings, bonusAmount: parseInt(e.target.value) || 0})}
                      data-testid="input-bonus-amount"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoApprove">Auto-approve Commissions</Label>
                  <Switch
                    id="autoApprove"
                    checked={commissionSettings.autoApproveCommissions}
                    onCheckedChange={(checked) => setCommissionSettings({...commissionSettings, autoApproveCommissions: checked})}
                    data-testid="switch-auto-approve"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('Commissions')}
                    disabled={loading}
                    data-testid="button-save-commissions"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Settings */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Rocket.Chat Integration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableChat">Enable Rocket.Chat</Label>
                      <p className="text-sm text-muted-foreground">Replace current chat system with Rocket.Chat</p>
                    </div>
                    <Switch
                      id="enableChat"
                      checked={chatSettings.enableChat}
                      onCheckedChange={(checked) => setChatSettings({...chatSettings, enableChat: checked})}
                      data-testid="switch-enable-chat"
                    />
                  </div>

                  {chatSettings.enableChat && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="chatServer">Rocket.Chat Server URL</Label>
                        <Input
                          id="chatServer"
                          value={chatSettings.rocketChatServer}
                          onChange={(e) => setChatSettings({...chatSettings, rocketChatServer: e.target.value})}
                          placeholder="https://your-server.rocket.chat"
                          data-testid="input-chat-server"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                          <Input
                            id="maxFileSize"
                            type="number"
                            min="1"
                            max="100"
                            value={chatSettings.maxFileSize}
                            onChange={(e) => setChatSettings({...chatSettings, maxFileSize: parseInt(e.target.value) || 10})}
                            data-testid="input-max-file-size"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retention">Message Retention (days)</Label>
                          <Input
                            id="retention"
                            type="number"
                            min="1"
                            max="365"
                            value={chatSettings.retentionPeriod}
                            onChange={(e) => setChatSettings({...chatSettings, retentionPeriod: parseInt(e.target.value) || 90})}
                            data-testid="input-retention"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="fileSharing">Enable File Sharing</Label>
                        <Switch
                          id="fileSharing"
                          checked={chatSettings.enableFileSharing}
                          onCheckedChange={(checked) => setChatSettings({...chatSettings, enableFileSharing: checked})}
                          data-testid="switch-file-sharing"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="chatPushNotifications">Enable Push Notifications</Label>
                        <Switch
                          id="chatPushNotifications"
                          checked={chatSettings.enablePushNotifications}
                          onCheckedChange={(checked) => setChatSettings({...chatSettings, enablePushNotifications: checked})}
                          data-testid="switch-chat-push"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('Chat')}
                    disabled={loading}
                    data-testid="button-save-chat"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System & Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dataExport">Enable Data Export</Label>
                    <Switch
                      id="dataExport"
                      checked={systemSettings.enableDataExport}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableDataExport: checked})}
                      data-testid="switch-data-export"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="bulkImport">Enable Bulk Import</Label>
                    <Switch
                      id="bulkImport"
                      checked={systemSettings.enableBulkImport}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableBulkImport: checked})}
                      data-testid="switch-bulk-import"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="24"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value) || 8})}
                      data-testid="input-session-timeout"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auditLog">Enable Audit Logging</Label>
                    <Switch
                      id="auditLog"
                      checked={systemSettings.enableAuditLog}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableAuditLog: checked})}
                      data-testid="switch-audit-log"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value: any) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                      <SelectTrigger data-testid="select-backup-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Prevent non-admin users from accessing the system</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={systemSettings.enableMaintenance}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableMaintenance: checked})}
                      data-testid="switch-maintenance"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('System')}
                    disabled={loading}
                    data-testid="button-save-system"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">
                    Manage user roles, permissions, and access levels
                  </p>
                  <Button 
                    className="flex items-center gap-2"
                    data-testid="button-add-user"
                  >
                    <Users className="h-4 w-4" />
                    Add New User
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="selfRegistration">Allow Self Registration</Label>
                    <Switch
                      id="selfRegistration"
                      checked={orgSettings.allowSelfRegistration}
                      onCheckedChange={(checked) => setOrgSettings({...orgSettings, allowSelfRegistration: checked})}
                      data-testid="switch-self-registration"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center">
                      <Badge variant="default" className="mb-2">Admin</Badge>
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-muted-foreground">Full Access</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Badge variant="secondary" className="mb-2">Supervisor</Badge>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-sm text-muted-foreground">Team Management</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Badge variant="outline" className="mb-2">Call Center</Badge>
                      <p className="text-2xl font-bold">15</p>
                      <p className="text-sm text-muted-foreground">Lead Management</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Badge variant="outline" className="mb-2">Field Agent</Badge>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">Meeting Management</p>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('Users')}
                    disabled={loading}
                    data-testid="button-save-users"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ImportResultsModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportResult(null);
        }}
        result={importResult}
        onConfirmImport={handleConfirmImport}
        loading={importLoading}
      />
    </Layout>
  );
}
