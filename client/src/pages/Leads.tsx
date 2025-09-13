import React, { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../hooks/useAuth";
import { useLeads } from "../hooks/useFirestore";
import { formatDistanceToNow } from "date-fns";
import { Search, Filter, Plus } from "lucide-react";
import type { Lead, LeadStatus } from "../types";

export default function Leads() {
  const { currentUser } = useAuth();
  const { leads, loading } = useLeads(currentUser?.organizationId || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "interested": return "bg-green-100 text-green-800";
      case "meeting": return "bg-purple-100 text-purple-800";
      case "converted": return "bg-emerald-100 text-emerald-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!currentUser) return null;

  return (
    <Layout 
      title="Leads Management"
      subtitle="Track and manage your sales leads"
      quickActionLabel="Add Lead"
    >
      <div data-testid="leads-content">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads by name, company, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-leads"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: LeadStatus | "all") => setStatusFilter(value)}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" data-testid="button-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground" data-testid="leads-loading">
                Loading leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center" data-testid="leads-empty">
                <div className="text-muted-foreground mb-4">
                  {leads.length === 0 ? "No leads found" : "No leads match your search criteria"}
                </div>
                <Button data-testid="button-add-first-lead">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Lead
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredLeads.map((lead, index) => (
                  <div 
                    key={lead.id} 
                    className="p-6 hover:bg-muted/50 transition-colors"
                    data-testid={`lead-item-${index}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground" data-testid={`lead-name-${index}`}>
                            {lead.name}
                          </h3>
                          <Badge 
                            className={getStatusColor(lead.status)}
                            data-testid={`lead-status-${index}`}
                          >
                            {lead.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {lead.company && (
                            <p data-testid={`lead-company-${index}`}>
                              <span className="font-medium">Company:</span> {lead.company}
                            </p>
                          )}
                          {lead.email && (
                            <p data-testid={`lead-email-${index}`}>
                              <span className="font-medium">Email:</span> {lead.email}
                            </p>
                          )}
                          {lead.phone && (
                            <p data-testid={`lead-phone-${index}`}>
                              <span className="font-medium">Phone:</span> {lead.phone}
                            </p>
                          )}
                          {lead.estimatedValue && (
                            <p data-testid={`lead-value-${index}`}>
                              <span className="font-medium">Est. Value:</span> ${lead.estimatedValue.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        {lead.notes && (
                          <p className="mt-2 text-sm text-foreground" data-testid={`lead-notes-${index}`}>
                            {lead.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-muted-foreground" data-testid={`lead-created-${index}`}>
                          Created {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-view-lead-${index}`}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-edit-lead-${index}`}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
