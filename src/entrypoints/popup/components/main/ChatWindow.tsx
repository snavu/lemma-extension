import { useState } from '#imports';
import './main.css'

interface ChatWindowProps {
  messages: { id: string; content: string; }[]
}

export const ChatWindow = (props: ChatWindowProps) => {
  const [messages, setMessages] = useState(props.messages);

  const handleSend = (message: string) => {
    setMessages([...messages, { id: `Q-${messages.length + 1}`, content: message }]);
  };
  const handleReceive = (message: string) => {
    setMessages([...messages, { id: `R-${messages.length + 1}`, content: message }]);
  };

  return (
    <div className="chat-window" >
      <div className="chat-messages">
        {messages.map((message) => (
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
      </div>
    </div>
  );
}
