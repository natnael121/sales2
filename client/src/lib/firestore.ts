import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  User,
  InsertUser,
  Organization,
  InsertOrganization,
  Lead,
  InsertLead,
  Call,
  InsertCall,
  Meeting,
  InsertMeeting,
  Commission,
  InsertCommission,
  ChatMessage,
  InsertChatMessage
} from "../types";

// Helper function to convert Firestore timestamp to Date
const convertTimestamps = (data: any): any => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// Organizations
export const createOrganization = async (data: InsertOrganization): Promise<Organization> => {
  const docRef = await addDoc(collection(db, "organizations"), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const doc = await getDoc(docRef);
  return { id: docRef.id, ...convertTimestamps(doc.data()) } as Organization;
};

export const getOrganization = async (id: string): Promise<Organization | null> => {
  const docRef = doc(db, "organizations", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Organization;
  }
  return null;
};

// Users
export const createUser = async (id: string, data: InsertUser): Promise<User> => {
  const docRef = doc(db, "users", id);
  const userData = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(docRef, userData);
  return { id, ...userData } as User;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...convertTimestamps(doc.data()) } as User;
  }
  return null;
};

export const getUser = async (id: string): Promise<User | null> => {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as User;
  }
  return null;
};

export const getUsersByOrganization = async (organizationId: string): Promise<User[]> => {
  const q = query(
    collection(db, "users"), 
    where("organizationId", "==", organizationId),
    where("isActive", "==", true)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as User[];
};

// Leads
export const createLead = async (data: InsertLead): Promise<Lead> => {
  const docRef = await addDoc(collection(db, "leads"), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...convertTimestamps(docSnap.data()) } as Lead;
};

export const updateLead = async (id: string, data: Partial<InsertLead>): Promise<void> => {
  const docRef = doc(db, "leads", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date()
  });
};

export const deleteLead = async (id: string): Promise<void> => {
  const docRef = doc(db, "leads", id);
  await deleteDoc(docRef);
};

export const getLeadsByOrganization = async (organizationId: string): Promise<Lead[]> => {
  const q = query(
    collection(db, "leads"), 
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as Lead[];
};

export const getLeadsByAgent = async (agentId: string): Promise<Lead[]> => {
  const q = query(
    collection(db, "leads"), 
    where("assignedToId", "==", agentId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as Lead[];
};

// Calls
export const createCall = async (data: InsertCall): Promise<Call> => {
  const docRef = await addDoc(collection(db, "calls"), {
    ...data,
    createdAt: new Date()
  });
  
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...convertTimestamps(docSnap.data()) } as Call;
};

export const getCallsByLead = async (leadId: string): Promise<Call[]> => {
  const q = query(
    collection(db, "calls"), 
    where("leadId", "==", leadId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as Call[];
};

// Meetings
export const createMeeting = async (data: InsertMeeting): Promise<Meeting> => {
  const docRef = await addDoc(collection(db, "meetings"), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...convertTimestamps(docSnap.data()) } as Meeting;
};

export const updateMeeting = async (id: string, data: Partial<InsertMeeting>): Promise<void> => {
  const docRef = doc(db, "meetings", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date()
  });
};

export const getMeetingsByAgent = async (agentId: string): Promise<Meeting[]> => {
  const q = query(
    collection(db, "meetings"), 
    where("fieldAgentId", "==", agentId),
    orderBy("scheduledAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as Meeting[];
};

// Commissions
export const createCommission = async (data: InsertCommission): Promise<Commission> => {
  const docRef = await addDoc(collection(db, "commissions"), {
    ...data,
    createdAt: new Date()
  });
  
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...convertTimestamps(docSnap.data()) } as Commission;
};

export const getCommissionsByUser = async (userId: string): Promise<Commission[]> => {
  const q = query(
    collection(db, "commissions"), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as Commission[];
};

// Chat Messages
export const createChatMessage = async (data: InsertChatMessage): Promise<ChatMessage> => {
  const docRef = await addDoc(collection(db, "chat_messages"), {
    ...data,
    createdAt: new Date()
  });
  
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...convertTimestamps(docSnap.data()) } as ChatMessage;
};

export const subscribeToChatMessages = (
  organizationId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const q = query(
    collection(db, "chat_messages"), 
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as ChatMessage[];
    callback(messages);
  });
};

// Real-time subscriptions
export const subscribeToLeads = (
  organizationId: string,
  callback: (leads: Lead[]) => void
): (() => void) => {
  const q = query(
    collection(db, "leads"), 
    where("organizationId", "==", organizationId),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Lead[];
    callback(leads);
  });
};
