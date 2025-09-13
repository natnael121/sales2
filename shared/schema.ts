import { z } from "zod";

// User Roles
export type UserRole = "admin" | "supervisor" | "call-center" | "field-agent";

// Lead Status Types
export type LeadStatus = "new" | "contacted" | "interested" | "meeting" | "converted" | "closed";

// Call Outcome Types
export type CallOutcome = "picked-interested" | "picked-not-interested" | "picked-meeting-setup" | "picked-call-later" | "not-picked-switched-off" | "not-picked-no-answer" | "not-picked-wrong-number";

// Meeting Result Types
export type MeetingResult = "interested" | "not-interested" | "purchase" | "follow-up";

// Organization Schema
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertOrganizationSchema = organizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Organization = z.infer<typeof organizationSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

// User Schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "supervisor", "call-center", "field-agent"]),
  organizationId: z.string(),
  supervisorId: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Lead Schema
export const leadSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  assignedToId: z.string().optional(),
  name: z.string(),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["new", "contacted", "interested", "meeting", "converted", "closed"]),
  source: z.string().optional(),
  notes: z.string().optional(),
  estimatedValue: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertLeadSchema = leadSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Lead = z.infer<typeof leadSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Call Schema
export const callSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  agentId: z.string(),
  organizationId: z.string(),
  outcome: z.enum(["picked-interested", "picked-not-interested", "picked-meeting-setup", "picked-call-later", "not-picked-switched-off", "not-picked-no-answer", "not-picked-wrong-number"]),
  duration: z.number().optional(),
  notes: z.string().optional(),
  scheduledCallback: z.date().optional(),
  createdAt: z.date(),
});

export const insertCallSchema = callSchema.omit({
  id: true,
  createdAt: true,
});

export type Call = z.infer<typeof callSchema>;
export type InsertCall = z.infer<typeof insertCallSchema>;

// Meeting Schema
export const meetingSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  agentId: z.string(),
  fieldAgentId: z.string().optional(),
  organizationId: z.string(),
  scheduledAt: z.date(),
  duration: z.number().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  result: z.enum(["interested", "not-interested", "purchase", "follow-up"]).optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  isCompleted: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertMeetingSchema = meetingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Meeting = z.infer<typeof meetingSchema>;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

// Commission Schema
export const commissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  leadId: z.string().optional(),
  meetingId: z.string().optional(),
  type: z.enum(["meeting", "conversion", "purchase", "bonus"]),
  amount: z.number(),
  isApproved: z.boolean().default(false),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  createdAt: z.date(),
});

export const insertCommissionSchema = commissionSchema.omit({
  id: true,
  createdAt: true,
});

export type Commission = z.infer<typeof commissionSchema>;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;

// Chat Message Schema
export const chatMessageSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  senderId: z.string(),
  recipientId: z.string().optional(),
  leadId: z.string().optional(),
  groupId: z.string().optional(),
  message: z.string(),
  type: z.enum(["direct", "group", "lead"]).default("direct"),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
});

export const insertChatMessageSchema = chatMessageSchema.omit({
  id: true,
  createdAt: true,
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Analytics/Metrics Types
export interface DashboardMetrics {
  totalLeads: number;
  conversionRate: number;
  activeAgents: number;
  revenue: number;
}

export interface ConversionFunnelData {
  leads: number;
  contacted: number;
  meetings: number;
  conversions: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  role: UserRole;
  conversions: number;
  growth: number;
}

export interface RecentActivityItem {
  id: string;
  type: "call" | "meeting" | "conversion";
  agentName: string;
  leadName: string;
  action: string;
  timestamp: Date;
}
