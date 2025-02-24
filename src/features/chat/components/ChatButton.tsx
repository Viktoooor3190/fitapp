import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg
        ${isOpen ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default ChatButton; 