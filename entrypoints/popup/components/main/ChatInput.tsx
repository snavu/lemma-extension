import './main.css';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput = (props: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const handleSend = () => {
    // Only send if there's a message
    if (message.trim()) {
      // Logic to send the message
      console.log('Message sent');
      // Call the onSend function passed as a prop
      props.onSend(message);
      // Clear the input field after sending
      setMessage('');
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
      <button type="submit" onClick={handleSend}>
        <SendIcon />
      </button>
    </div>
  );
}
