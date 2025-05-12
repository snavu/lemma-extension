import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
// import components from './components';
import { ChatWindow } from './components/main/ChatWindow';
import { ChatInput } from './components/main/ChatInput';
import { CreateNote } from './components/header/CreateNote';


function App() {

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
          <ChatWindow />
          <ChatInput />
        </div>
      </div>
  </div>
  );
}

export default App;
