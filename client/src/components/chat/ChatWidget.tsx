import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useChatMessages } from "../../hooks/useFirestore";
import { createChatMessage } from "../../lib/firestore";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "../../types";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { messages, loading } = useChatMessages(currentUser?.organizationId || "");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || sending) return;

    setSending(true);
    try {
      await createChatMessage({
        organizationId: currentUser.organizationId,
        senderId: currentUser.uid,
        message: message.trim(),
        type: "group",
        isRead: false
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n.charAt(0))
      .join("")
      .toUpperCase();
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
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl" data-testid="chat-panel">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Team Chat</h3>
            <p className="text-sm text-muted-foreground">
              {messages.length > 0 ? `${messages.length} messages` : "No messages"}
            </p>
          </div>
          
          <div className="h-64 p-4 overflow-y-auto space-y-3" data-testid="chat-messages">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground">No messages yet</div>
            ) : (
              messages.slice().reverse().map((msg, index) => (
                <div key={msg.id} className="flex items-start space-x-2" data-testid={`chat-message-${index}`}>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">
                      {getInitials(msg.senderId)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground" data-testid={`chat-message-text-${index}`}>
                      {msg.message}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`chat-message-time-${index}`}>
                      {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-border">
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
        </Card>
      )}
    </div>
  );
};
