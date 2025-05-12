
import './main.css';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput = (props: ChatInputProps) => {
  const handleSend = () => {
    // Logic to send the message
    console.log('Message sent');
    // Call the onSend function passed as a prop
    props.onSend('Hello, this is a test message!');
  };
  return (
    <div className="chat-input">
      <input type="text" placeholder="Type your message here..." />
      <button type="submit" onClick={handleSend}>Send</button>
    </div>
  );
}
