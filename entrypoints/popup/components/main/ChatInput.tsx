import './ChatInput.css';
import { forwardRef, useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  // chatRef: React.RefObject<ChatMessageHandle>;
}

// type ChatInputProps = {
//   chatRef: React.RefObject<ChatMessageHandle | null>;
// };

// const chatRef = useRef<ChatMessageHandle>(null);

export const ChatInput = 
  (props: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

    const handleSend = async () => {
      // Only send if there's a message or not sending
      if (isAwaitingResponse || message.trim() === '') return;
      
      // Clear the input field after sending
      setMessage('');
      setIsAwaitingResponse(true);

      console.log('Message sent');
      try {
        // Call the onSend function passed as a prop
        await props.onSend(message);
      } finally {
        setIsAwaitingResponse(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    };

    const SendIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    );

    return (
      <div className="chat-input">
        <input 
          type="text" 
          placeholder="Type your message here..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {isAwaitingResponse ? (
          <div className="circle-loader"></div>
          ) : (
          <button type="submit" onClick={handleSend}>
            <SendIcon />
          </button>
          )
        }
      </div>
    );
  };
