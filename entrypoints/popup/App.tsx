import { useState } from 'react';
import './App.css';

// import components from './components';
import { ChatWindow } from './components/main/ChatWindow';
import { ChatInput } from './components/main/ChatInput';
import { CreateNote } from './components/header/CreateNote';

// import icon assests
import logo from '../../assets/img/lemma_round.png';

// Function to get the current tab Attributes
async function getCurrentTabAttributes() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    return null;
  }

  const result = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText,
      };
    },
  });

  if (result && result[0] && result[0].result) {
    const { title, url, text } = result[0].result;
    return {
      title,
      url,
      text,
      date: new Date().toISOString(),
    };
  } else {
    console.error('Failed to get the current tab attributes');
    return null;
  }
}

function App() {
  const [chatMessages, setChatMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [questionCounter, setQuestionCounter] = useState(1);
  const [responseCounter, setResponseCounter] = useState(1);

  const handleOnSend = async (message: string) => {
    // Add message with Q-counter
    const newUserMessage: { id: string; role: 'user' | 'assistant'; content: string } = { 
      id: `Q-${questionCounter}`, 
      role: 'user', 
      content: message 
    };
    const updatedMessages: { id: string; role: 'user' | 'assistant'; content: string }[] = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    
    // Increment question counter
    setQuestionCounter(questionCounter + 1);

    // Get tab attributes
    const webContent = await getCurrentTabAttributes();
    console.log('Web Content:', webContent);

    if (!webContent) {
      console.error('Failed to get web content');
      return;
    }

    //Send the message and tab ID to the background script
    browser.runtime.sendMessage({
      type: 'askQuestion',
      query: message,
      webContent: webContent.text,
      webAttributes: webContent,
      prevMessages: updatedMessages
    }).then((response) => {
      console.log('Received response from background script:', response);
      // Add the response to the chat messages
      const responseMessage: { id: string; role: 'user' | 'assistant'; content: string } = { 
        id: `R-${responseCounter}`, 
        role: 'assistant', 
        content: response.answer 
      };
      setChatMessages((prevMessages) => [
        ...prevMessages,
        responseMessage
      ]);
      // Increment response counter
      setResponseCounter(prev => prev + 1);
    }, (error) => {
      console.error('Error sending message to background script:', error);
    });
  };

  const handleSaveNote = async (title: string) => {
    console.log('Save Note button clicked');
    // Get tab attributes
    const webContent = await getCurrentTabAttributes();
    console.log('Web Content:', webContent);

    if (!webContent) {
      console.error('Failed to get web content');
      return;
    }
    // send the message and tab content to the background script
    browser.runtime.sendMessage({
      type: 'saveNote',
      title: title,
      webAttributes: webContent,
    });
  };

  return (
    <div className="App">
      <div className="header">
        <div className="logo">

          <h1>LEMMA</h1>
        </div>
        <div className="header-right">
          <CreateNote onSaveNote={handleSaveNote} />
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
