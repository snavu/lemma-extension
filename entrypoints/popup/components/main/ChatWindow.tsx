import './main.css'

interface ChatWindowProps {
  messages: { id: string; content: string; }[]
}

export const ChatWindow = (props: ChatWindowProps) => {
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
      </div>
    </div>
  );
}
