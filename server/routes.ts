import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as RocketChat from '@rocket.chat/sdk';

// Rocket.Chat service class for server-side integration
class RocketChatService {
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

      this.driver = await RocketChat.driver.connect({ host: this.config.host });
      this.api = RocketChat.api;
      
      await this.driver.login({ 
        username: this.config.username, 
        password: this.config.password 
      });
      
      this.currentUserId = await this.driver.userId();
      this.connected = true;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Rocket.Chat:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.driver && this.connected) {
        await this.driver.logout();
        this.connected = false;
        this.currentUserId = null;
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  async getRooms(): Promise<any[]> {
    try {
      if (!this.connected) await this.connect();
      const rooms = await this.api.get('rooms.get', {}, true);
      return rooms.update || [];
    } catch (error) {
      console.error('Failed to get rooms:', error);
      return [];
    }
  }

  async createDirectMessage(username: string): Promise<string | null> {
    try {
      if (!this.connected) await this.connect();
      const result = await this.api.post('im.create', { username }, true);
      return result.room?._id || null;
    } catch (error) {
      console.error('Failed to create direct message:', error);
      return null;
    }
  }

  async sendMessage(roomId: string, message: string): Promise<boolean> {
    try {
      if (!this.connected) await this.connect();
      await this.driver.sendToRoom(roomId, message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  async getRoomMessages(roomId: string, count: number = 50): Promise<any[]> {
    try {
      if (!this.connected) await this.connect();
      const result = await this.api.get('rooms.messages', { roomId, count }, true);
      return result.messages || [];
    } catch (error) {
      console.error('Failed to get room messages:', error);
      return [];
    }
  }

  async searchUsers(query: string): Promise<any[]> {
    try {
      if (!this.connected) await this.connect();
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
}

const rocketChatService = new RocketChatService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Rocket.Chat API routes
  app.get('/api/chat/rooms', async (req, res) => {
    try {
      const rooms = await rocketChatService.getRooms();
      res.json({ success: true, rooms });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get rooms' });
    }
  });

  app.post('/api/chat/rooms/direct', async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ success: false, error: 'Username required' });
      }
      
      const roomId = await rocketChatService.createDirectMessage(username);
      if (roomId) {
        res.json({ success: true, roomId });
      } else {
        res.status(500).json({ success: false, error: 'Failed to create room' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create direct message' });
    }
  });

  app.post('/api/chat/messages', async (req, res) => {
    try {
      const { roomId, message } = req.body;
      if (!roomId || !message) {
        return res.status(400).json({ success: false, error: 'Room ID and message required' });
      }
      
      const success = await rocketChatService.sendMessage(roomId, message);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: 'Failed to send message' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  });

  app.get('/api/chat/messages/:roomId', async (req, res) => {
    try {
      const { roomId } = req.params;
      const count = parseInt(req.query.count as string) || 50;
      
      const messages = await rocketChatService.getRoomMessages(roomId, count);
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get messages' });
    }
  });

  app.get('/api/chat/users/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ success: false, error: 'Search query required' });
      }
      
      const users = await rocketChatService.searchUsers(q);
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to search users' });
    }
  });

  app.get('/api/chat/connection', async (req, res) => {
    try {
      const connected = await rocketChatService.connect();
      res.json({ success: true, connected });
    } catch (error) {
      res.status(500).json({ success: false, connected: false, error: 'Connection failed' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
