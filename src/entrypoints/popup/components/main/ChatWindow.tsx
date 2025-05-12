
import './main.css'

export const ChatWindow = () => {
  return (
    <div className="chat-window" style={{ backgroundColor: 'pink', height: '100%', overflowY: 'auto' }}>
      <div className="chat-message">
        <div className="message-content">Hello, how can I help you today?</div>
      </div>
      <div className="chat-message">
        <div className="message-content">I have a question about my order.</div>
      </div>
      <div className="chat-message">
        <div className="message-content">Sure, what would you like to know?</div>
      </div>
    </div>
  );
}
