import { useState, useEffect } from "react";
import type { Lead, Meeting, Commission, ChatMessage, Call } from "../types";
import * as firestore from "../lib/firestore";

export const useLeads = (organizationId: string) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = firestore.subscribeToLeads(organizationId, (newLeads) => {
      setLeads(newLeads);
      setLoading(false);
    });

    return unsubscribe;
  }, [organizationId]);

  return { leads, loading, error };
};

export const useMeetings = (agentId: string) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agentId) return;

    const fetchMeetings = async () => {
      try {
        const data = await firestore.getMeetingsByAgent(agentId);
        setMeetings(data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [agentId]);

  return { meetings, loading };
};

export const useCommissions = (userId: string) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchCommissions = async () => {
      try {
        const data = await firestore.getCommissionsByUser(userId);
        setCommissions(data);
      } catch (error) {
        console.error("Error fetching commissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [userId]);

  return { commissions, loading };
};

export const useChatMessages = (organizationId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    try {
      const unsubscribe = firestore.subscribeToChatMessages(organizationId, (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        setError(null);
      });

      return unsubscribe;
    } catch (err: any) {
      console.error("Error subscribing to chat messages:", err);
      setError(err.message || "Failed to load chat messages");
      setLoading(false);
    }
  }, [organizationId]);

  return { messages, loading, error };
};

// Organization-level hooks for analytics
export const useCalls = (organizationId: string) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const fetchCalls = async () => {
      try {
        const data = await firestore.getCallsByOrganization(organizationId);
        setCalls(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching calls:", error);
        setError("Failed to fetch calls");
        setLoading(false);
      }
    };

    fetchCalls();
  }, [organizationId]);

  return { calls, loading, error };
};

export const useOrganizationMeetings = (organizationId: string) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const fetchMeetings = async () => {
      try {
        const data = await firestore.getMeetingsByOrganization(organizationId);
        setMeetings(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching organization meetings:", error);
        setError("Failed to fetch meetings");
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [organizationId]);

  return { meetings, loading, error };
};
