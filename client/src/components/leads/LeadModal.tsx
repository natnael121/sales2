import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import { createLead, updateLead } from "../../lib/firestore";
import { User, Lead, LeadStatus, InsertLead } from "../../types";
import { Save, X } from "lucide-react";

// Form validation schema
const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  estimatedValue: z.number().min(0, "Value must be positive").optional(),
  status: z.enum(["new", "contacted", "interested", "meeting", "converted", "closed"]),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional()
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
  agents?: User[];
  mode: "create" | "edit" | "view";
}

export const LeadModal: React.FC<LeadModalProps> = ({ 
  isOpen, 
  onClose, 
  lead, 
  agents = [], 
  mode 
}) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      estimatedValue: undefined,
      status: "new",
      source: "",
      notes: "",
      assignedToId: ""
    }
  });

  // Reset form when modal opens/closes or lead changes
  useEffect(() => {
    if (isOpen && lead && (mode === "edit" || mode === "view")) {
      form.reset({
        name: lead.name,
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        estimatedValue: lead.estimatedValue,
        status: lead.status,
        source: lead.source || "",
        notes: lead.notes || "",
        assignedToId: lead.assignedToId || ""
      });
    } else if (isOpen && mode === "create") {
      form.reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        estimatedValue: undefined,
        status: "new",
        source: "",
        notes: "",
        assignedToId: ""
      });
    }
  }, [isOpen, lead, mode, form]);

  const handleSubmit = async (data: LeadFormData) => {
    if (!currentUser?.organizationId) {
      toast({
        title: "Error",
        description: "No organization found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const leadData: InsertLead = {
        ...data,
        organizationId: currentUser.organizationId,
        estimatedValue: data.estimatedValue || 0,
        email: data.email || undefined,
        phone: data.phone || undefined,
        company: data.company || undefined,
        source: data.source || undefined,
        notes: data.notes || undefined,
        assignedToId: data.assignedToId || undefined
      };

      if (mode === "create") {
        await createLead(leadData);
        toast({
          title: "Success",
          description: "Lead created successfully"
        });
      } else if (mode === "edit" && lead) {
        await updateLead(lead.id, leadData);
        toast({
          title: "Success", 
          description: "Lead updated successfully"
        });
      }

      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Error saving lead:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save lead",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="lead-modal-title">
            {mode === "create" && "Create New Lead"}
            {mode === "edit" && "Edit Lead"}
            {mode === "view" && "Lead Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Name - Required */}
            <div className="col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Lead's full name"
                disabled={isReadOnly}
                data-testid="input-lead-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="contact@example.com"
                disabled={isReadOnly}
                data-testid="input-lead-email"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+1 (555) 123-4567"
                disabled={isReadOnly}
                data-testid="input-lead-phone"
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...form.register("company")}
                placeholder="Company name"
                disabled={isReadOnly}
                data-testid="input-lead-company"
              />
            </div>

            {/* Estimated Value */}
            <div>
              <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
              <Input
                id="estimatedValue"
                type="number"
                min="0"
                step="0.01"
                {...form.register("estimatedValue", { valueAsNumber: true })}
                placeholder="10000"
                disabled={isReadOnly}
                data-testid="input-lead-value"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: LeadStatus) => form.setValue("status", value)}
                disabled={isReadOnly}
              >
                <SelectTrigger data-testid="select-lead-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                {...form.register("source")}
                placeholder="Website, Referral, Cold Call..."
                disabled={isReadOnly}
                data-testid="input-lead-source"
              />
            </div>

            {/* Assigned Agent */}
            <div>
              <Label htmlFor="assignedAgent">Assigned Agent</Label>
              <Select
                value={form.watch("assignedToId")}
                onValueChange={(value) => form.setValue("assignedToId", value)}
                disabled={isReadOnly}
              >
                <SelectTrigger data-testid="select-assigned-agent">
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Additional notes about this lead..."
                rows={3}
                disabled={isReadOnly}
                data-testid="textarea-lead-notes"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-lead"
            >
              <X className="w-4 h-4 mr-2" />
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            
            {!isReadOnly && (
              <Button
                type="submit"
                disabled={loading}
                data-testid="button-save-lead"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : mode === "create" ? "Create Lead" : "Update Lead"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};