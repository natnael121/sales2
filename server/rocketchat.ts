import * as RocketChat from '@rocket.chat/sdk';

// Rocket.Chat service class for server-side integration
export class RocketChatService {
  private driver: any = null;
  private api: any = null;
  private connected: boolean = false;
  private currentUserId: string | null = null;
  private config = {
    host: process.env.ROCKETCHAT_HOST || 'localhost:3000',
    useSsl: process.env.ROCKETCHAT_USE_SSL === 'true',
    username: process.env.ROCKETCHAT_USERNAME || 'admin',
    password: process.env.ROCKETCHAT_PASSWORD || 'demo123'
  };

  async connect(): Promise<boolean> {
    try {
      if (this.connected) return true;

      console.log(`Attempting to connect to Rocket.Chat at ${this.config.host}`);
      
      this.driver = await RocketChat.driver.connect({ 
        host: this.config.host,
        useSsl: this.config.useSsl
      });
      this.api = RocketChat.api;
      
      await this.driver.login({ 
        username: this.config.username, 
        password: this.config.password 
      });
      
      this.currentUserId = await this.driver.userId();
      this.connected = true;
      
      console.log('Successfully connected to Rocket.Chat');
      return true;
    } catch (error) {
      console.error('Failed to connect to Rocket.Chat:', error);
      this.connected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.driver && this.connected) {
        await this.driver.logout();
        this.connected = false;
        this.currentUserId = null;
        console.log('Disconnected from Rocket.Chat');
      }
    } catch (error) {
      console.error('Failed to disconnect from Rocket.Chat:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getRooms(): Promise<any[]> {
    try {
      if (!this.connected) {
        const success = await this.connect();
        if (!success) return [];
      }
      
      const rooms = await this.api.get('rooms.get', {}, true);
      return rooms.update || [];
    } catch (error) {
      console.error('Failed to get rooms:', error);
      return [];
    }
  }

  async createDirectMessage(username: string): Promise<string | null> {
    try {
      if (!this.connected) {
        const success = await this.connect();
        if (!success) return null;
      }
      
      const result = await this.api.post('im.create', { username }, true);
      return result.room?._id || null;
    } catch (error) {
      console.error('Failed to create direct message:', error);
      return null;
    }
  }

  async sendMessage(roomId: string, message: string): Promise<boolean> {
    try {
      if (!this.connected) {
        const success = await this.connect();
        if (!success) return false;
      }
      
      await this.driver.sendToRoom(roomId, message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  async getRoomMessages(roomId: string, count: number = 50): Promise<any[]> {
    try {
      if (!this.connected) {
        const success = await this.connect();
        if (!success) return [];
      }
      
      const result = await this.api.get('rooms.messages', { roomId, count }, true);
      return result.messages || [];
    } catch (error) {
      console.error('Failed to get room messages:', error);
      return [];
    }
  }

  async searchUsers(query: string): Promise<any[]> {
    try {
      if (!this.connected) {
        const success = await this.connect();
        if (!success) return [];
      }
      
      const result = await this.api.get('users.list', {
        query: { $or: [
          { username: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ]}
      }, true);
      return result.users || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  async createPrivateGroup(name: string, usernames: string[]): Promise<string | null> {
    try {
      if (!this.connected) {
        const success = await this.connect();
        if (!success) return null;
      }
      
      const result = await this.api.post('groups.create', {
        name: name,
        members: usernames
      }, true);
      return result.group?._id || null;
    } catch (error) {
      console.error('Failed to create private group:', error);
      return null;
    }
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export const rocketChatService = new RocketChatService();

// Initialize connection on startup
rocketChatService.connect().catch(error => {
  console.error('Failed to initialize Rocket.Chat connection:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down Rocket.Chat service...');
  await rocketChatService.disconnect();
});

process.on('SIGINT', async () => {
  console.log('Shutting down Rocket.Chat service...');
  await rocketChatService.disconnect();
});