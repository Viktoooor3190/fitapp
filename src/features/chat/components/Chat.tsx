import React from 'react';
import { useChatBox } from '../hooks/useChatBox';
import ChatBox from './ChatBox';
import ChatButton from './ChatButton';

const Chat: React.FC = () => {
  const { chatState, toggleChat, sendMessage, closeChat } = useChatBox();

  return (
    <>
      <ChatButton onClick={toggleChat} isOpen={chatState.isOpen} />
      <ChatBox
        chatState={chatState}
        onClose={closeChat}
        onSendMessage={sendMessage}
      />
    </>
  );
};

export default Chat; 