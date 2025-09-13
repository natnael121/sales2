import { useState, useEffect } from "react";
import type { Lead, Meeting, Commission, ChatMessage } from "../types";
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

  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = firestore.subscribeToChatMessages(organizationId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return unsubscribe;
  }, [organizationId]);

  return { messages, loading };
};
