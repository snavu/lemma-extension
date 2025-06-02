import './main.css'
import { useEffect, useRef } from 'react';

interface ChatWindowProps {
  messages: { id: string; content: string; }[]
}

export const ChatWindow = (props: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [props.messages]);

  return (
    <div className="chat-window" >
      <div className="chat-messages">
        {props.messages.map((message) => (
          <div
            key={message.id}
            className="chat-message"
            id={message.id}
          >
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
