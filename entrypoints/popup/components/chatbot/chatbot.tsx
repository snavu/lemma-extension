import React, { useRef, useState, useEffect, useCallback, Dispatch, SetStateAction, forwardRef, useImperativeHandle } from 'react';
import { ChatHeader } from './chatHeader';
import { ChatMessage, ChatMessageHandle } from './chatMessage';
import { ChatInput } from './chatInput';
import './chatbot.css';

interface chatUIProps {
  isChatOpen: boolean;
  setIsChatOpen: (bool: boolean) => void;
  messages: { role: 'user' | 'assistant'; content: string }[];
  setMessages: Dispatch<SetStateAction<{ role: 'user' | 'assistant'; content: string }[]>>;
}

export const ChatUI: React.FC<chatUIProps> = ({ isChatOpen, setIsChatOpen, messages, setMessages }) => {
  const chatRef = useRef<ChatMessageHandle>(null);

  return (
    <div
      className="chat-floating"
    >
      <ChatHeader
        setIsChatOpen={setIsChatOpen}
        setMessages={setMessages}
      />
      <ChatMessage
        messages={messages}
        isChatOpen={isChatOpen}
        ref={chatRef}
      />
      <ChatInput ChatMessageHandle={chatRef} />
    </div>
  );
};
