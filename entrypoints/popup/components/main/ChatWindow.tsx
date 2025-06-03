import { useState } from 'react';
import { getCurrentTabAttributes } from '../../App';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import './ChatWindow.css'

export const ChatWindow = () => {
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
    const updatedMessages: { id: string; role: 'user' | 'assistant'; content: string }[] = [
      ...chatMessages, 
      newUserMessage,
      { id: `R-${chatMessages.length+1}`, role: 'assistant', content: 'Thinking...' }
    ];
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

    const port = browser.runtime.connect({ name: 'chatQuery' });
    port.postMessage({
      type: 'askQuestion',
      query: message,
      prevMessages: updatedMessages,
      webContent: webContent.text,
      webAttributes: webContent,
    });

    let assistantMessage = '';

    await new Promise<void>((resolve, reject) => {
      const onMessage = (msg: any) => {
        if (msg.done) {
          setResponseCounter(prev => prev + 1);
          port.disconnect();
          port.onMessage.removeListener(onMessage);
          resolve();
        } else if (msg.chunk) {
          // Update streamed response incrementally
          assistantMessage += msg.chunk;
          const responseMessage: { id: string; role: 'user' | 'assistant'; content: string } = { 
            id: `R-${responseCounter}`, 
            role: 'assistant', 
            content: assistantMessage
          };

          setChatMessages((prev) => {
            console.log(responseMessage.content);
            const updated = [...prev];
            updated[updated.length - 1] = responseMessage;
            return updated;
          });
        }
      };

      port.onMessage.addListener(onMessage);

      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(onMessage);
        // if (!assistantMessage) {
        //   reject(new Error('Port disconnected unexpectedly before streaming finished.'));
        // }
      });
    });

    //Send the message and tab ID to the background script
    // await browser.runtime.sendMessage({
    //   type: 'askQuestion',
    //   query: message,
    //   webContent: webContent.text,
    //   webAttributes: webContent,
    //   prevMessages: updatedMessages
    // }).then((response) => {
    //   console.log('Received response from background script:', response);
    //   // Add the response to the chat messages
    //   const responseMessage: { id: string; role: 'user' | 'assistant'; content: string } = { 
    //     id: `R-${responseCounter}`, 
    //     role: 'assistant', 
    //     content: response.answer 
    //   };
    //   setChatMessages((prevMessages) => [
    //     ...prevMessages,
    //     responseMessage
    //   ]);
    //   // Increment response counter
    //   setResponseCounter(prev => prev + 1);
    // }, (error) => {
    //   console.error('Error sending message to background script:', error);
    // });
  };

  return (
    <div className='chat-window'>
      <ChatMessage chatMessages={chatMessages}/>
      <ChatInput onSend={handleOnSend}/>
    </div>
  );
};