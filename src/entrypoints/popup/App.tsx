import { useState } from 'react';
import './App.css';

// import components from './components';
import { ChatWindow } from './components/main/ChatWindow';
import { ChatInput } from './components/main/ChatInput';
import { CreateNote } from './components/header/CreateNote';


let messages = [
  { id: 'R-1', content: 'Hello, how can I help you today?' },
  { id: 'Q-1', content: 'I have a question about my order.' },
  { id: 'R-2', content: 'Sure, what would you like to know?' },
  { id: 'Q-2', content: 'Can you provide an update on the shipping status?' },
  { id: 'R-3', content: 'Your order is scheduled to ship tomorrow.' },
  { id: 'Q-3', content: 'Thank you for the information!' },
  { id: 'R-4', content: 'You\'re welcome! If you have any other questions, feel free to ask.' },
];

function App() {
  const [chatMessages, setChatMessages] = useState(messages);

  const handleOnSend = (message: string) => {
    // Logic to send the message
    console.log('Message sent');
    // Call the onSend function passed as a prop
    console.log(message);
    setChatMessages([...chatMessages, { id: `Q-${chatMessages.length + 1}`, content: message }]);
  };

  return (
    <div className="App">
      <div className="header">
        <div className="logo">
          <h1>LEMMA</h1>
        </div>
        <div className="header-right">
          <CreateNote />
        </div>
      </div>
      <div className="main">
        {/*<div className="sidebar">
          <div className="sidebar-item">Item 1</div>
          <div className="sidebar-item">Item 2</div>
          <div className="sidebar-item">Item 3</div>
        </div>*/}
        <div className="content">
          <ChatWindow messages={chatMessages} />
          <ChatInput onSend={handleOnSend} />
        </div>
      </div>
    </div>
  );
}

export default App;
