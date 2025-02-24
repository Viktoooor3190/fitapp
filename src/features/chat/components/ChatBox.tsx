import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Loader2 } from "lucide-react";
import ChatMessage from './ChatMessage';
import { ChatState } from '../types';

interface ChatBoxProps {
  chatState: ChatState;
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatState, onClose, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatState.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  if (!chatState.isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-[380px] h-[500px] flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold">Chat with Coach</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
        {chatState.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {chatState.isTyping && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Coach is typing...</span>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatBox; 