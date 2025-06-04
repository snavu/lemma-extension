import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { getCurrentTabAttributes } from '../../App';
import Markdown from 'react-markdown';
import './ChatMessage.css';

interface ChatWindowProps {
  chatMessages: { id: string; role: 'user' | 'assistant'; content: string }[];
}

export const ChatMessage =
  (props: ChatWindowProps) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      // Auto-scroll to the bottom with message
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, [props.chatMessages]);

    return (
      <div className="chat-messages">
        {props.chatMessages.map((message) => (
          message.content === 'Thinking...' ? (
            <div
              key={message.id}
              className="chat-message"
              id={message.id}
            >
              <div className="message-content">
                <div className="dot-loader"></div>
              </div>
            </div>
          ) : (
            <div
              key={message.id}
              className="chat-message"
              id={message.id}
            >
              <div className="message-content">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };
