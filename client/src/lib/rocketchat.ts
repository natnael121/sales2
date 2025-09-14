// Backend-based Rocket.Chat client for browser compatibility
// Uses API calls to backend instead of direct SDK

export interface RocketChatRoom {
  _id: string;
  name: string;
  type: 'c' | 'p' | 'd'; // channel, private, direct
  usernames?: string[];
  lastMessage?: {
    msg: string;
    ts: Date;
    u: {
      _id: string;
      username: string;
    };
  };
}

export interface RocketChatMessage {
  _id: string;
  rid: string; // room id
  msg: string;
  ts: Date;
  u: {
    _id: string;
    username: string;
    name?: string;
  };
  t?: string; // message type
  groupable?: boolean;
  parseUrls?: boolean;
  editedBy?: any;
  editedAt?: Date;
  urls?: any[];
  mentions?: any[];
  channels?: any[];
}

class RocketChatService {
  private connected: boolean = false;
  private baseUrl: string;

  constructor() {
    this.baseUrl = window.location.origin; // Use same origin for API calls
  }

  // Check connection status via backend
  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/connection`);
      const data = await response.json();
      this.connected = data.connected;
      return data.connected;
    } catch (error) {
      console.error('Failed to check connection:', error);
      this.connected = false;
      return false;
    }
  }

  // Get all rooms via backend API
  async getRooms(): Promise<RocketChatRoom[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/rooms`);
      const data = await response.json();
      return data.success ? data.rooms : [];
    } catch (error) {
      console.error('Failed to get rooms:', error);
      return [];
    }
  }

  // Create a direct message room via backend API
  async createDirectMessage(username: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/rooms/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      return data.success ? data.roomId : null;
    } catch (error) {
      console.error('Failed to create direct message:', error);
      return null;
    }
  }

  // Send a message via backend API
  async sendMessage(roomId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, message }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  // Get room messages via backend API
  async getRoomMessages(roomId: string, count: number = 50): Promise<RocketChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/messages/${roomId}?count=${count}`);
      const data = await response.json();
      return data.success ? data.messages : [];
    } catch (error) {
      console.error('Failed to get room messages:', error);
      return [];
    }
  }

  // Search for users via backend API
  async searchUsers(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.success ? data.users : [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  // Create private group via backend API
  async createPrivateGroup(name: string, usernames: string[]): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/rooms/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, usernames }),
      });
      const data = await response.json();
      return data.success ? data.roomId : null;
    } catch (error) {
      console.error('Failed to create private group:', error);
      return null;
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Placeholder methods for compatibility
  async disconnect(): Promise<void> {
    this.connected = false;
  }

  // For real-time updates, we'd implement WebSocket or polling
  // For now, return a no-op unsubscribe function
  subscribeToRoom(roomId: string, callback: (message: RocketChatMessage) => void): () => void {
    // In a full implementation, this would set up WebSocket connection
    // or polling for new messages
    return () => {};
  }

  getCurrentUserId(): string | null {
    return null; // Would be implemented with proper auth
  }
}

// Create singleton instance
export const rocketChatService = new RocketChatService();

// Hook for React components
export const useRocketChat = () => {
  return {
    service: rocketChatService,
    isConnected: rocketChatService.isConnected()
  };
};

export type { RocketChatRoom, RocketChatMessage };