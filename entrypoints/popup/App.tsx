import { useState } from 'react';
import './App.css';

// import components from './components';
import { ChatMessage } from './components/main/ChatMessage';
import { ChatWindow } from './components/main/ChatWindow';
import { ChatInput } from './components/main/ChatInput';
import { CreateNote } from './components/header/CreateNote';

// import icon assests
import logo from '../../assets/img/lemma_round.png';

// Function to get the current tab Attributes
export async function getCurrentTabAttributes() {
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
        <div className="content">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}

export default App;
