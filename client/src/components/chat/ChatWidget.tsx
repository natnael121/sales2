import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Send, 
  Users, 
  UserPlus, 
  Settings,
  X,
  Plus,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { rocketChatService, type RocketChatRoom, type RocketChatMessage } from "../../lib/rocketchat";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "../../hooks/use-toast";

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  participants: string[];
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<RocketChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Rocket.Chat connection
  useEffect(() => {
    const initializeRocketChat = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setConnectionError(null);
        
        const success = await rocketChatService.connect();
        setConnected(success);
        
        if (success) {
          await loadRooms();
          toast({
            title: "Chat Connected",
            description: "Successfully connected to Rocket.Chat server"
          });
        } else {
          setConnectionError("Unable to connect to Rocket.Chat server. Please check server configuration.");
          toast({
            title: "Chat Connection Failed",
            description: "Unable to connect to Rocket.Chat. Please contact your administrator.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('Failed to initialize Rocket.Chat:', error);
        setConnectionError(error.message || "Failed to connect to chat server");
        setConnected(false);
        toast({
          title: "Chat Error",
          description: "Failed to initialize chat system. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && isOpen) {
      initializeRocketChat();
    }
  }, [currentUser, isOpen, toast]);

  // Load user's rooms
  const loadRooms = async () => {
    try {
      const rocketRooms = await rocketChatService.getRooms();
      const chatRooms: ChatRoom[] = rocketRooms.map(room => ({
        id: room._id,
        name: room.name || room.usernames?.join(', ') || 'Unknown',
        type: room.type === 'd' ? 'direct' : 'group',
        lastMessage: room.lastMessage?.msg,
        lastMessageTime: room.lastMessage?.ts,
        unreadCount: 0,
        participants: room.usernames || []
      }));
      
      setRooms(chatRooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive"
      });
    }
  };

  // Load messages for selected room
  const loadMessages = async (roomId: string) => {
    try {
      setLoading(true);
      const roomMessages = await rocketChatService.getRoomMessages(roomId, 50);
      setMessages(roomMessages);
      
      // Subscribe to new messages for this room
      const unsubscribe = rocketChatService.subscribeToRoom(roomId, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
      return () => {};
    } finally {
      setLoading(false);
    }
  };

  // Handle room selection
  const handleRoomSelect = useCallback(async (roomId: string) => {
    setSelectedRoom(roomId);
    await loadMessages(roomId);
  }, []);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedRoom || sending) return;

    setSending(true);
    try {
      const success = await rocketChatService.sendMessage(selectedRoom, message.trim());
      if (success) {
        setMessage("");
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully"
        });
      } else {
        toast({
          title: "Send Failed",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Search users
  const handleUserSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await rocketChatService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast({
        title: "Search Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    }
  };

  // Create direct message
  const createDirectMessage = async (username: string) => {
    try {
      const roomId = await rocketChatService.createDirectMessage(username);
      if (roomId) {
        await loadRooms();
        setSelectedRoom(roomId);
        setShowNewChat(false);
        setSearchQuery("");
        setSearchResults([]);
        toast({
          title: "Chat Created",
          description: `Started conversation with ${username}`
        });
      }
    } catch (error) {
      console.error('Failed to create direct message:', error);
      toast({
        title: "Error",
        description: "Failed to create direct message",
        variant: "destructive"
      });
    }
  };

  // Create group chat
  const createGroupChat = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      const roomId = await rocketChatService.createPrivateGroup(groupName, selectedUsers);
      if (roomId) {
        await loadRooms();
        setSelectedRoom(roomId);
        setShowNewGroup(false);
        setGroupName("");
        setSelectedUsers([]);
        setSearchQuery("");
        setSearchResults([]);
        toast({
          title: "Group Created",
          description: `Created group "${groupName}" successfully`
        });
      }
    } catch (error) {
      console.error('Failed to create group chat:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive"
      });
    }
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40" data-testid="chat-widget">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        data-testid="button-chat-toggle"
      >
        <MessageSquare className="text-xl" />
        {rooms.some(room => room.unreadCount > 0) && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
            {rooms.reduce((total, room) => total + room.unreadCount, 0)}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-96 h-96 shadow-xl flex flex-col" data-testid="chat-panel">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Rocket.Chat
              </CardTitle>
              <div className="flex items-center space-x-2">
                {connected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewChat(true)}
                    data-testid="button-new-chat"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {loading ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-muted-foreground">Connecting...</span>
                </>
              ) : connected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-muted-foreground">Disconnected</span>
                </>
              )}
            </div>
          </CardHeader>
          
          <div className="flex-1 flex flex-col min-h-0">
            {connectionError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border-b">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium">Connection Error</p>
                    <p>{connectionError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!connected && !loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground p-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Chat Unavailable</p>
                  <p className="text-sm">Unable to connect to Rocket.Chat server</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
            
            {connected && !selectedRoom && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Conversations</h3>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewChat(true)}
                        title="Start direct message"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewGroup(true)}
                        title="Create group chat"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {rooms.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No conversations yet. Start chatting!
                    </div>
                  ) : (
                    <div className="p-2">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                          onClick={() => handleRoomSelect(room.id)}
                          data-testid={`room-${room.id}`}
                        >
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {room.type === 'direct' ? getInitials(room.name) : <Users className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{room.name}</h4>
                              {room.lastMessageTime && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(room.lastMessageTime, { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            {room.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate">
                                {room.lastMessage}
                              </p>
                            )}
                          </div>
                          {room.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
            
            {connected && selectedRoom && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRoom(null)}
                      className="p-0 h-auto"
                    >
                      ← Back
                    </Button>
                    <h3 className="font-medium">
                      {rooms.find(r => r.id === selectedRoom)?.name}
                    </h3>
                    <div></div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {loading ? (
                    <div className="text-center text-muted-foreground">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">No messages yet</div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg._id} className="flex items-start space-x-2" data-testid={`message-${msg._id}`}>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(msg.u.name || msg.u.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {msg.u.name || msg.u.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(msg.ts, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground break-words">
                              {msg.msg}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sending}
                      className="flex-1"
                      data-testid="input-chat-message"
                    />
                    <Button 
                      type="submit" 
                      disabled={sending || !message.trim()}
                      size="sm"
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* New Chat Dialog */}
      {showNewChat && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl" data-testid="new-chat-dialog">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">New Chat</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewChat(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              className="mb-4"
              data-testid="input-user-search"
            />
            <ScrollArea className="max-h-48">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => createDirectMessage(user.username)}
                  data-testid={`user-${user.username}`}
                >
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback>
                      {getInitials(user.name || user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name || user.username}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* New Group Dialog */}
      {showNewGroup && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl" data-testid="new-group-dialog">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Create Group</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewGroup(false);
                  setGroupName("");
                  setSelectedUsers([]);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Input
              type="text"
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              data-testid="input-group-name"
            />
            <Input
              type="text"
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              data-testid="input-group-user-search"
            />
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((username) => (
                  <Badge key={username} variant="secondary">
                    {username}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-0 h-4 w-4"
                      onClick={() => setSelectedUsers(prev => prev.filter(u => u !== username))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <ScrollArea className="max-h-32">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center p-2 hover:bg-muted rounded cursor-pointer ${
                    selectedUsers.includes(user.username) ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    if (selectedUsers.includes(user.username)) {
                      setSelectedUsers(prev => prev.filter(u => u !== user.username));
                    } else {
                      setSelectedUsers(prev => [...prev, user.username]);
                    }
                  }}
                  data-testid={`group-user-${user.username}`}
                >
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback>
                      {getInitials(user.name || user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{user.name || user.username}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                  {selectedUsers.includes(user.username) && (
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
            <Button
              onClick={createGroupChat}
              disabled={!groupName.trim() || selectedUsers.length === 0}
              className="w-full"
              data-testid="button-create-group"
            >
              Create Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};