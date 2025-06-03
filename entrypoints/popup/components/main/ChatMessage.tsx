import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { getCurrentTabAttributes } from '../../App';
import './ChatMessage.css';

interface ChatWindowProps {
  chatMessages: { id: string; role: 'user' | 'assistant'; content: string }[];
}

// export type ChatMessageHandle = {
//   handleOnSend: (message: string) => void;
//   chatMessages: { id: string; role: 'user' | 'assistant'; content: string }[];
// }

export const ChatWindow =
  (props: ChatWindowProps) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [displayChatMessages, setDisplayChatMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (props.chatMessages.length && props.chatMessages[props.chatMessages.length-1].role === 'user') {
        setDisplayChatMessages([
          ...props.chatMessages, 
          { id: `R-${props.chatMessages.length}`, role: 'assistant', content: 'Thinking...' }
        ]);
      }
      else {
        setDisplayChatMessages(props.chatMessages);
      }
      console.log('updated');
      console.log(props.chatMessages);
    }, [props.chatMessages]);

    return (
      <div className="chat-messages">
        {displayChatMessages.map((message) => (
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
