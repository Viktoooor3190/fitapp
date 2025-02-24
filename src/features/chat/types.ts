export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'coach';
  timestamp: Date;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
} 