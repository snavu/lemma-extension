
import './main.css';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput = (props: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const handleSend = () => {
    // Logic to send the message
    console.log('Message sent');
    // Call the onSend function passed as a prop
    props.onSend(message);
  };
  return (
    <div className="chat-input">
      <input type="text" placeholder="Type your message here..." value={message} onChange={(e) => setMessage(e.target.value)} />
      <button type="submit" onClick={handleSend}>Send</button>
    </div>
  );
}
