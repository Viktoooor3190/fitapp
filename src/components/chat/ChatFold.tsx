import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ChatFoldProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatFold = ({ isOpen, onClose }: ChatFoldProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 400, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden bg-gray-800 rounded-xl shadow-xl"
        >
          <div className="flex flex-col h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <h2 className="text-sm font-semibold text-white">Messages</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-2 text-sm max-w-[80%]">
                    Hi Coach, how are you?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white rounded-lg p-2 text-sm max-w-[80%]">
                    Hey! I'm doing great. How's your training going?
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-700">
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white text-sm rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatFold; 