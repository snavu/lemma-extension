import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { getCurrentTabAttributes } from '../../App';
import './ChatMessage.css';

interface ChatWindowProps {
  chatMessages: { id: string; role: 'user' | 'assistant'; content: string }[];
}

export const ChatMessage =
  (props: ChatWindowProps) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [displayChatMessages, setDisplayChatMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);

    useEffect(() => {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
      console.log('updated');
      console.log(props.chatMessages);
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
                {message.content}
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };
