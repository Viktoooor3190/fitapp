import React from 'react';
import { Message } from '../types';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isCoach = message.sender === 'coach';
  
  return (
    <div className={`flex items-start gap-2.5 ${isCoach ? 'flex-row' : 'flex-row-reverse'}`}>
      <Avatar className="w-8 h-8">
        {isCoach ? (
          <AvatarImage src="/coach-avatar.png" alt="Coach" />
        ) : (
          <AvatarImage src="/user-avatar.png" alt="User" />
        )}
        <AvatarFallback>{isCoach ? 'C' : 'U'}</AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col w-full max-w-[320px] leading-1.5 ${isCoach ? 'items-start' : 'items-end'}`}>
        <div className={`flex items-center space-x-2 rtl:space-x-reverse ${isCoach ? 'flex-row' : 'flex-row-reverse'}`}>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {isCoach ? 'Coach' : 'You'}
          </span>
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {format(message.timestamp, 'HH:mm')}
          </span>
        </div>
        <div className={`
          px-4 py-2 rounded-lg 
          ${isCoach 
            ? 'bg-gray-100 dark:bg-gray-700 rounded-tl-none' 
            : 'bg-blue-500 text-white rounded-tr-none'
          }
        `}>
          <p className="text-sm font-normal">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 