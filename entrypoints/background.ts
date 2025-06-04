// define background scripts
export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Listen for connection to port 'chatQuery'
  // Ask question with context of current page -- Parameters: webContent, question
  // Stream each token received to the frontend
  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== 'chatQuery') return;

    // On port, listen to each response received from the server
    port.onMessage.addListener(async (message) => {
      if (message.type === 'askQuestion') {
        const { webContent, query, prevMessages, webAttributes } = message;

        try {
          const stream = await sendQueryToLemma(webContent, query, prevMessages, webAttributes?.url || '');
          // Process each token
          for await (const chunk of stream) {
            port.postMessage({ chunk }); // Send each token/chunk
          }
          port.postMessage({ done: true }); // Signal end of stream
        } catch (err) {
          console.error('Streaming failed:', err);
          port.postMessage({ error: err });
          port.disconnect();
        }
      }

      port.disconnect();
    });
  });

  // listen for messages from content script
  // save current page as a note in the Lemma application
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'saveNote') {
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

// Helper function to limit content size for HTTP requests
function limitContentSize(content: string, maxSizeKB: number = 50): string {
  const maxChars = maxSizeKB * 1024;
  if (content.length > maxChars) {
    return content.slice(0, maxChars);
  }
  return content;
}

/**
 * Background script to get all the text in the current web page
 * Props: currentPage: tab, query: string
 * Async iterable function that yield token by token
 */
async function* sendQueryToLemma(webContent: string, query: string, prevMessages: string[], url: string) {
  if (webContent.length > 5000) {
    // Limit webContent size to prevent request size issues
    webContent = limitContentSize(webContent);
    console.warn('Web content size exceeded 5000 characters, limiting to:', webContent.length);
  }
  // send a message to the content script to get the text of the current page
  console.log('Sending query to Lemma:', {
    webContentSize: webContent.length,
    content: webContent,
    query,
    prevMessages,
    url
  });

  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webContent: webContent, query, prevMessages, url }),
    });

    // Check if the response is ok
    if (!res.ok || !res.body) {
      console.error('HTTP error:', res.status, res.statusText);
      if (res.status === 404) {
        yield 'Error: API endpoint not found. Make sure the Lemma server is running with the correct routes.';
        return;
      }
      yield `Error: Server responded with ${res.status} ${res.statusText}`;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      // Read each chunk received from the stream
      // If done, exit
      const { done, value } = await reader.read();
      if (done) break;

      // Decode each chunk and yield it
      const chunkRes = decoder.decode(value, { stream: true });
      if (chunkRes) {
        yield chunkRes;
      };
    }
  } catch (error) {
    console.error('Error calling Lemma API:', error);
    yield 'Error: Could not connect to Lemma';
  }
}

/**
 * background script to save the current page as a note in the Lemma application
 * Props: currentPage: tab, title: string, content: string, URL: string
 * returns: success: boolean
 */
async function saveNoteToLemma(webContent: string, title: string, URL: string) {
  let limitedWebContent = webContent;
  // Check if webContent is provided
  if (webContent.length > 500000) {
    // Limit webContent size to prevent request size issues
    limitedWebContent = limitContentSize(webContent);
  }

  // send a message to the content script to save the note
  console.log('Saving note to Lemma:', {
    webContentSize: webContent.length,
    limitedSize: limitedWebContent.length,
    title,
    URL
  });

  try {
    const res = await fetch('http://localhost:3001/api/save-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webContent: limitedWebContent, title, url: URL }),
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

