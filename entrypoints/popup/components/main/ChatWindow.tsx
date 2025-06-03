import { useState } from 'react';
import { getCurrentTabAttributes } from '../../App';
import { ChatInput } from './ChatInput';
import { ChatWindow } from './ChatMessage';
import './ChatWindow.css'

export const Chatbot = () => {
  const [chatMessages, setChatMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [questionCounter, setQuestionCounter] = useState(1);
  const [responseCounter, setResponseCounter] = useState(1);

  const handleOnSend = async (message: string) => {
    console.log('handleOnSend sent');
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
    await browser.runtime.sendMessage({
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

  return (
    <div className='chat-window'>
      <ChatWindow chatMessages={chatMessages}/>
      <ChatInput onSend={handleOnSend}/>
    </div>
  );
};