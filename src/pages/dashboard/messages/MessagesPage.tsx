import { useState } from 'react';
import { 
  Search, MoreVertical, Send, 
  Paperclip, Image, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, listItem, fadeInUp } from '../../../animations/dashboard';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// Add new animation variants
const chatWindowAnimation = {
  initial: { 
    opacity: 0,
    x: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1
    }
  },
  exit: { 
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: { 
      duration: 0.2 
    }
  }
};

const messageAnimation = {
  initial: { 
    opacity: 0,
    y: 10
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2
    }
  }
};

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data - replace with Firestore data later
  const chats: Chat[] = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      lastMessage: 'Thanks for the workout plan!',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      clientName: 'Mike Smith',
      lastMessage: 'When is our next session?',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false
    },
    // Add more chats...
  ];

  const messages: Message[] = [
    {
      id: '1',
      senderId: 'client1',
      senderName: 'Sarah Johnson',
      content: 'Hi coach! Just completed today\'s workout.',
      timestamp: '10:25 AM',
      isRead: true
    },
    {
      id: '2',
      senderId: 'coach',
      senderName: 'You',
      content: 'Great job! How did you find the new exercises?',
      timestamp: '10:28 AM',
      isRead: true
    },
    {
      id: '3',
      senderId: 'client1',
      senderName: 'Sarah Johnson',
      content: 'Thanks for the workout plan!',
      timestamp: '10:30 AM',
      isRead: false
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Add message sending logic here
    setMessageInput('');
  };

  return (
    <motion.div 
      className="h-full flex"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Chat List */}
      <motion.div 
        className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        variants={fadeInUp}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-5rem)]">
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              variants={listItem}
              className={`p-4 flex items-center space-x-4 cursor-pointer border-b border-gray-200 dark:border-gray-700 transition-colors ${
                selectedChat === chat.id 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {chat.clientName}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {chat.lastMessageTime}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">
                    {chat.unreadCount}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div 
        className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden"
        variants={fadeInUp}
      >
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div
              key={selectedChat}
              variants={chatWindowAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full"
            >
              {/* Chat Header */}
              <motion.div 
                className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {chats.find(c => c.id === selectedChat)?.clientName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Active now
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </motion.div>

              {/* Messages */}
              <motion.div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      variants={messageAnimation}
                      initial="initial"
                      animate="animate"
                      className={`flex ${message.senderId === 'coach' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === 'coach'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                      >
                        <p className={message.senderId === 'coach' ? 'text-white' : 'text-gray-900 dark:text-white'}>
                          {message.content}
                        </p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'coach'
                            ? 'text-blue-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Message Input */}
              <motion.div 
                className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Image className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <p className="text-gray-500 dark:text-gray-400">
                Select a conversation to start messaging
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default MessagesPage; 