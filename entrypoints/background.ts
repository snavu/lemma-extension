// define background scripts
export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  // listen for messages from content script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message from content script:', message);
    console.log('webContent:', message.webContent);
    console.log('webAttributes:', message.webAttributes);

    // check if the message is from the content script
    // Option 1: ask qution with context of current page -- Perameter: webContent, question
    // Option 2: save current page as a note in the Lemma application
    if (message.type === 'askQuestion') {
      // call sendQueryToLemma function to get the answer
      sendQueryToLemma(message.webContent, message.query, message.prevMessages, message.webAttributes?.url || '').then((answer) => {
        // send the answer back to the content script
        sendResponse({ answer });
      });
      return true; // This keeps the message channel open for the async response
    } else if (message.type === 'saveNote') {
      // call saveNoteToLemma function to save the note
      saveNoteToLemma(
        message.webAttributes.text,
        message.title,
        message.webAttributes.url
      ).then((success) => {
        // send the success status back to the content script
        sendResponse({ success });
      });
      return true; // This keeps the message channel open for the async response
    }
  });
});


// background script to get all the text in the current web page
// Props: currentPage: tab, query: string
// returns content: text
async function sendQueryToLemma(webContent: string, query: string, prevMessages: string[], url: string) {
  // send a message to the content script to get the text of the current page
  console.log('Sending query to Lemma:', { webContent, query, prevMessages, url });

  //Ollama API call


  return 'This is a dummy answer from Lemma'; // replace with actual answer
}

// background script to save the current page as a note in the Lemma application
// Props: currentPage: tab, title: string, content: string, URL: string
// returns: success: boolean

async function saveNoteToLemma(webContent: string, title: string, URL: string) {
  // send a message to the content script to save the note
  console.log('Saving note to Lemma:', { webContent, title, URL });

  // Save the note through the Lemma applicaiton
  return true;
}

