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

  return (
    <div className="chat-input">
      <input 
        type="text" 
        placeholder="Type your message here..." 
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" onClick={handleSend}>Send</button>
    </div>
  );
}
