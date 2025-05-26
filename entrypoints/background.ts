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

  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webContent, query, prevMessages, url }),
    });

    // Check if the response is ok
    if (!res.ok) {
      console.error('HTTP error:', res.status, res.statusText);
      if (res.status === 404) {
        return 'Error: API endpoint not found. Make sure the Lemma server is running with the correct routes.';
      }
      return `Error: Server responded with ${res.status} ${res.statusText}`;
    }

    // Check if response has content
    const responseText = await res.text();
    if (!responseText) {
      console.error('Empty response from server');
      return 'Error: Empty response from server';
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', responseText);
      return 'Error: Invalid response format from server';
    }

    console.log('Response from Lemma:', data);
    return data.answer || 'No answer received from server';
  } catch (error) {
    console.error('Error calling Lemma API:', error);
    return 'Error: Could not connect to Lemma';
  }
}

// background script to save the current page as a note in the Lemma application
// Props: currentPage: tab, title: string, content: string, URL: string
// returns: success: boolean

async function saveNoteToLemma(webContent: string, title: string, URL: string) {
  // send a message to the content script to save the note
  console.log('Saving note to Lemma:', { webContent, title, URL });

  try {
    const res = await fetch('http://localhost:3001/api/save-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webContent, title, url: URL }),
    });

    // Check if the response is ok
    if (!res.ok) {
      console.error('HTTP error:', res.status, res.statusText);
      if (res.status === 404) {
        console.error('Error: API endpoint not found. Make sure the Lemma server is running with the correct routes.');
        return false;
      }
      console.error(`Error: Server responded with ${res.status} ${res.statusText}`);
      return false;
    }

    // Check if response has content
    const responseText = await res.text();
    if (!responseText) {
      console.error('Empty response from server');
      return false;
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', responseText);
      return false;
    }

    console.log('Response from Lemma save-note:', data);
    return data.success !== false; // Return true unless explicitly false
  } catch (error) {
    console.error('Error calling Lemma save-note API:', error);
    return false;
  }
}

