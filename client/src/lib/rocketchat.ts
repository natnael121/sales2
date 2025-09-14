// Backend-based Rocket.Chat client for browser compatibility
// Uses API calls to backend instead of direct SDK

interface RocketChatConfig {
  baseUrl: string;
  timeout: number;
}

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
  private config: RocketChatConfig;

  constructor() {
    this.config = {
      baseUrl: window.location.origin,
      timeout: 10000 // 10 seconds
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  // Check connection status via backend
  async connect(): Promise<boolean> {
    try {
      const data = await this.makeRequest('/api/chat/connection');
      this.connected = data.connected;
      return data.connected;
    } catch (error) {
      console.error('Failed to connect to chat service:', error);
      this.connected = false;
      return false;
    }
  }

  // Get all rooms via backend API
  async getRooms(): Promise<RocketChatRoom[]> {
    try {
      const data = await this.makeRequest('/api/chat/rooms');
      return data.success ? data.rooms : [];
    } catch (error) {
      console.error('Failed to get rooms:', error);
      return [];
    }
  }

  // Create a direct message room via backend API
  async createDirectMessage(username: string): Promise<string | null> {
    try {
      const data = await this.makeRequest('/api/chat/rooms/direct', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      return data.success ? data.roomId : null;
    } catch (error) {
      console.error('Failed to create direct message:', error);
      return null;
    }
  }

  // Send a message via backend API
  async sendMessage(roomId: string, message: string): Promise<boolean> {
    try {
      const data = await this.makeRequest('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ roomId, message }),
      });
      return data.success;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  // Get room messages via backend API
  async getRoomMessages(roomId: string, count: number = 50): Promise<RocketChatMessage[]> {
    try {
      const data = await this.makeRequest(`/api/chat/messages/${roomId}?count=${count}`);
      return data.success ? data.messages : [];
    } catch (error) {
      console.error('Failed to get room messages:', error);
      return [];
    }
  }

  // Search for users via backend API
  async searchUsers(query: string): Promise<any[]> {
    try {
      const data = await this.makeRequest(`/api/chat/users/search?q=${encodeURIComponent(query)}`);
      return data.success ? data.users : [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  // Create private group via backend API
  async createPrivateGroup(name: string, usernames: string[]): Promise<string | null> {
    try {
      const data = await this.makeRequest('/api/chat/rooms/group', {
        method: 'POST',
        body: JSON.stringify({ name, usernames }),
      });
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
    console.log('Disconnected from chat service');
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

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const data = await this.makeRequest('/api/health');
      return data.status === 'ok' && data.services?.rocketchat === 'connected';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
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