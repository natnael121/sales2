import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { rocketChatService } from "./rocketchat";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        rocketchat: rocketChatService.isConnected() ? 'connected' : 'disconnected'
      }
    });
  });

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

  app.post('/api/chat/rooms/group', async (req, res) => {
    try {
      const { name, usernames } = req.body;
      if (!name || !Array.isArray(usernames)) {
        return res.status(400).json({ success: false, error: 'Group name and usernames array required' });
      }
      
      const roomId = await rocketChatService.createPrivateGroup(name, usernames);
      if (roomId) {
        res.json({ success: true, roomId });
      } else {
        res.status(500).json({ success: false, error: 'Failed to create group' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create private group' });
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
      res.json({ 
        success: true, 
        connected,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chat connection error:', error);
      res.status(500).json({ 
        success: false, 
        connected: false, 
        error: 'Connection failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
