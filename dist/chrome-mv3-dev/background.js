var background = function() {
  "use strict";
  var _a, _b;
  function defineBackground(arg) {
    if (arg == null || typeof arg === "function") return { main: arg };
    return arg;
  }
  const browser$1 = ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  const definition = defineBackground(() => {
    console.log("Hello background!", { id: browser.runtime.id });
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      var _a2;
      if (message.type === "askQuestion") {
        sendQueryToLemma(message.webContent, message.query, message.prevMessages, ((_a2 = message.webAttributes) == null ? void 0 : _a2.url) || "").then((answer) => {
          sendResponse({ answer });
        });
        return true;
      } else if (message.type === "saveNote") {
        saveNoteToLemma(
          message.webAttributes.text,
          message.title,
          message.webAttributes.url
        ).then((success) => {
          sendResponse({ success });
        });
        return true;
      }
    });
  });
  function limitContentSize(content, maxSizeKB = 50) {
    const maxChars = maxSizeKB * 1024;
    if (content.length > maxChars) {
      return content.slice(0, maxChars);
    }
    return content;
  }
  async function sendQueryToLemma(webContent, query, prevMessages, url) {
    let limitedWebContent = webContent;
    if (webContent.length > 5e5) {
      limitedWebContent = limitContentSize(webContent);
    }
    console.log("Sending query to Lemma:", {
      webContentSize: limitedWebContent.length,
      content: limitedWebContent,
      query,
      prevMessages,
      url
    });
    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webContent: limitedWebContent, query, prevMessages, url })
      });
      if (!res.ok) {
        console.error("HTTP error:", res.status, res.statusText);
        if (res.status === 404) {
          return "Error: API endpoint not found. Make sure the Lemma server is running with the correct routes.";
        }
        return `Error: Server responded with ${res.status} ${res.statusText}`;
      }
      const responseText = await res.text();
      if (!responseText) {
        console.error("Empty response from server");
        return "Error: Empty response from server";
      }
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", responseText);
        return "Error: Invalid response format from server";
      }
      console.log("Response from Lemma:", data);
      return data.answer || "No answer received from server";
    } catch (error) {
      console.error("Error calling Lemma API:", error);
      return "Error: Could not connect to Lemma";
    }
  }
  async function saveNoteToLemma(webContent, title, URL2) {
    let limitedWebContent = webContent;
    if (webContent.length > 5e5) {
      limitedWebContent = limitContentSize(webContent);
    }
    console.log("Saving note to Lemma:", {
      webContentSize: webContent.length,
      limitedSize: limitedWebContent.length,
      title,
      URL: URL2
    });
    try {
      const res = await fetch("http://localhost:3001/api/save-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webContent: limitedWebContent, title, url: URL2 })
      });
      if (!res.ok) {
        console.error("HTTP error:", res.status, res.statusText);
        if (res.status === 404) {
          console.error("Error: API endpoint not found. Make sure the Lemma server is running with the correct routes.");
          return false;
        }
        console.error(`Error: Server responded with ${res.status} ${res.statusText}`);
        return false;
      }
      const responseText = await res.text();
      if (!responseText) {
        console.error("Empty response from server");
        return false;
      }
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", responseText);
        return false;
      }
      console.log("Response from Lemma save-note:", data);
      return data.success !== false;
    } catch (error) {
      console.error("Error calling Lemma save-note API:", error);
      return false;
    }
  }
  background;
  function initPlugins() {
  }
  var _MatchPattern = class {
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._MatchPattern.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null)
          throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    includes(url) {
      if (this.isAllUrls)
        return true;
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http")
          return this.isHttpMatch(u);
        if (protocol === "https")
          return this.isHttpsMatch(u);
        if (protocol === "file")
          return this.isFileMatch(u);
        if (protocol === "ftp")
          return this.isFtpMatch(u);
        if (protocol === "urn")
          return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch)
        return false;
      const hostnameMatchRegexs = [
        this.convertPatternToRegex(this.hostnameMatch),
        this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))
      ];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isFileMatch(url) {
      throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
    }
    isFtpMatch(url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const escaped = this.escapeForRegex(pattern);
      const starsReplaced = escaped.replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };
  var MatchPattern = _MatchPattern;
  MatchPattern.PROTOCOLS = ["http", "https", "file", "ftp", "urn"];
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*")
      throw new InvalidMatchPattern(
        matchPattern,
        `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`
      );
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":"))
      throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*."))
      throw new InvalidMatchPattern(
        matchPattern,
        `If using a wildcard (*), it must go at the start of the hostname`
      );
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  let ws;
  function getDevServerWebSocket() {
    if (ws == null) {
      const serverUrl = "http://localhost:3000";
      logger.debug("Connecting to dev server @", serverUrl);
      ws = new WebSocket(serverUrl, "vite-hmr");
      ws.addWxtEventListener = ws.addEventListener.bind(ws);
      ws.sendCustom = (event, payload) => ws == null ? void 0 : ws.send(JSON.stringify({ type: "custom", event, payload }));
      ws.addEventListener("open", () => {
        logger.debug("Connected to dev server");
      });
      ws.addEventListener("close", () => {
        logger.debug("Disconnected from dev server");
      });
      ws.addEventListener("error", (event) => {
        logger.error("Failed to connect to dev server", event);
      });
      ws.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message.type === "custom") {
            ws == null ? void 0 : ws.dispatchEvent(
              new CustomEvent(message.event, { detail: message.data })
            );
          }
        } catch (err) {
          logger.error("Failed to handle message", err);
        }
      });
    }
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    const manifest = browser.runtime.getManifest();
    if (manifest.manifest_version == 2) {
      void reloadContentScriptMv2();
    } else {
      void reloadContentScriptMv3(payload);
    }
  }
  async function reloadContentScriptMv3({
    registration,
    contentScript
  }) {
    if (registration === "runtime") {
      await reloadRuntimeContentScriptMv3(contentScript);
    } else {
      await reloadManifestContentScriptMv3(contentScript);
    }
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser.scripting.updateContentScripts([{ ...contentScript, id }]);
    } else {
      logger.debug("Registering new content script...");
      await browser.scripting.registerContentScripts([{ ...contentScript, id }]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      var _a2, _b2;
      const hasJs = (_a2 = contentScript.js) == null ? void 0 : _a2.find((js) => {
        var _a3;
        return (_a3 = cs.js) == null ? void 0 : _a3.includes(js);
      });
      const hasCss = (_b2 = contentScript.css) == null ? void 0 : _b2.find((css) => {
        var _a3;
        return (_a3 = cs.css) == null ? void 0 : _a3.includes(css);
      });
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log(
        "Content script is not registered yet, nothing to reload",
        contentScript
      );
      return;
    }
    await browser.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser.tabs.query({});
    const matchPatterns = contentScript.matches.map(
      (match) => new MatchPattern(match)
    );
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url) return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(
      matchingTabs.map(async (tab) => {
        try {
          await browser.tabs.reload(tab.id);
        } catch (err) {
          logger.warn("Failed to reload tab:", err);
        }
      })
    );
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws2 = getDevServerWebSocket();
      ws2.addWxtEventListener("wxt:reload-extension", () => {
        browser.runtime.reload();
      });
      ws2.addWxtEventListener("wxt:reload-content-script", (event) => {
        reloadContentScript(event.detail);
      });
      if (true) {
        ws2.addEventListener(
          "open",
          () => ws2.sendCustom("wxt:background-initialized")
        );
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") {
        browser.runtime.reload();
      }
    });
  }
  let result;
  try {
    initPlugins();
    result = definition.main();
    if (result instanceof Promise) {
      console.warn(
        "The background's main() function return a promise, but it must be synchronous"
      );
    }
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  const result$1 = result;
  return result$1;
}();
background;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1iYWNrZ3JvdW5kLm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Ad3h0LWRldi9icm93c2VyL3NyYy9pbmRleC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci5tanMiLCIuLi8uLi9lbnRyeXBvaW50cy9iYWNrZ3JvdW5kLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3ZWJleHQtY29yZS9tYXRjaC1wYXR0ZXJucy9saWIvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUJhY2tncm91bmQoYXJnKSB7XG4gIGlmIChhcmcgPT0gbnVsbCB8fCB0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB7IG1haW46IGFyZyB9O1xuICByZXR1cm4gYXJnO1xufVxuIiwiLy8gI3JlZ2lvbiBzbmlwcGV0XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IGdsb2JhbFRoaXMuYnJvd3Nlcj8ucnVudGltZT8uaWRcbiAgPyBnbG9iYWxUaGlzLmJyb3dzZXJcbiAgOiBnbG9iYWxUaGlzLmNocm9tZTtcbi8vICNlbmRyZWdpb24gc25pcHBldFxuIiwiaW1wb3J0IHsgYnJvd3NlciBhcyBfYnJvd3NlciB9IGZyb20gXCJAd3h0LWRldi9icm93c2VyXCI7XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IF9icm93c2VyO1xuZXhwb3J0IHt9O1xuIiwiLy8gZGVmaW5lIGJhY2tncm91bmQgc2NyaXB0c1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQmFja2dyb3VuZCgoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdIZWxsbyBiYWNrZ3JvdW5kIScsIHsgaWQ6IGJyb3dzZXIucnVudGltZS5pZCB9KTtcbiAgLy8gbGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0XG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coJ1JlY2VpdmVkIG1lc3NhZ2UgZnJvbSBjb250ZW50IHNjcmlwdDonLCBtZXNzYWdlKTtcbiAgICAvLyBjb25zb2xlLmxvZygnd2ViQ29udGVudDonLCBtZXNzYWdlLndlYkNvbnRlbnQpO1xuICAgIC8vIGNvbnNvbGUubG9nKCd3ZWJBdHRyaWJ1dGVzOicsIG1lc3NhZ2Uud2ViQXR0cmlidXRlcyk7XG5cbiAgICAvLyBjaGVjayBpZiB0aGUgbWVzc2FnZSBpcyBmcm9tIHRoZSBjb250ZW50IHNjcmlwdFxuICAgIC8vIE9wdGlvbiAxOiBhc2sgcXV0aW9uIHdpdGggY29udGV4dCBvZiBjdXJyZW50IHBhZ2UgLS0gUGVyYW1ldGVyOiB3ZWJDb250ZW50LCBxdWVzdGlvblxuICAgIC8vIE9wdGlvbiAyOiBzYXZlIGN1cnJlbnQgcGFnZSBhcyBhIG5vdGUgaW4gdGhlIExlbW1hIGFwcGxpY2F0aW9uXG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ2Fza1F1ZXN0aW9uJykge1xuICAgICAgLy8gY2FsbCBzZW5kUXVlcnlUb0xlbW1hIGZ1bmN0aW9uIHRvIGdldCB0aGUgYW5zd2VyXG4gICAgICBzZW5kUXVlcnlUb0xlbW1hKG1lc3NhZ2Uud2ViQ29udGVudCwgbWVzc2FnZS5xdWVyeSwgbWVzc2FnZS5wcmV2TWVzc2FnZXMsIG1lc3NhZ2Uud2ViQXR0cmlidXRlcz8udXJsIHx8ICcnKS50aGVuKChhbnN3ZXIpID0+IHtcbiAgICAgICAgLy8gc2VuZCB0aGUgYW5zd2VyIGJhY2sgdG8gdGhlIGNvbnRlbnQgc2NyaXB0XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IGFuc3dlciB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7IC8vIFRoaXMga2VlcHMgdGhlIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciB0aGUgYXN5bmMgcmVzcG9uc2VcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ3NhdmVOb3RlJykge1xuICAgICAgLy8gY2FsbCBzYXZlTm90ZVRvTGVtbWEgZnVuY3Rpb24gdG8gc2F2ZSB0aGUgbm90ZVxuICAgICAgc2F2ZU5vdGVUb0xlbW1hKFxuICAgICAgICBtZXNzYWdlLndlYkF0dHJpYnV0ZXMudGV4dCxcbiAgICAgICAgbWVzc2FnZS50aXRsZSxcbiAgICAgICAgbWVzc2FnZS53ZWJBdHRyaWJ1dGVzLnVybFxuICAgICAgKS50aGVuKChzdWNjZXNzKSA9PiB7XG4gICAgICAgIC8vIHNlbmQgdGhlIHN1Y2Nlc3Mgc3RhdHVzIGJhY2sgdG8gdGhlIGNvbnRlbnQgc2NyaXB0XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3MgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBUaGlzIGtlZXBzIHRoZSBtZXNzYWdlIGNoYW5uZWwgb3BlbiBmb3IgdGhlIGFzeW5jIHJlc3BvbnNlXG4gICAgfVxuICB9KTtcbn0pO1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gbGltaXQgY29udGVudCBzaXplIGZvciBIVFRQIHJlcXVlc3RzXG5mdW5jdGlvbiBsaW1pdENvbnRlbnRTaXplKGNvbnRlbnQ6IHN0cmluZywgbWF4U2l6ZUtCOiBudW1iZXIgPSA1MCk6IHN0cmluZyB7XG4gIGNvbnN0IG1heENoYXJzID0gbWF4U2l6ZUtCICogMTAyNDtcbiAgaWYgKGNvbnRlbnQubGVuZ3RoID4gbWF4Q2hhcnMpIHtcbiAgICByZXR1cm4gY29udGVudC5zbGljZSgwLCBtYXhDaGFycyk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8vIGJhY2tncm91bmQgc2NyaXB0IHRvIGdldCBhbGwgdGhlIHRleHQgaW4gdGhlIGN1cnJlbnQgd2ViIHBhZ2Vcbi8vIFByb3BzOiBjdXJyZW50UGFnZTogdGFiLCBxdWVyeTogc3RyaW5nXG4vLyByZXR1cm5zIGNvbnRlbnQ6IHRleHRcbmFzeW5jIGZ1bmN0aW9uIHNlbmRRdWVyeVRvTGVtbWEod2ViQ29udGVudDogc3RyaW5nLCBxdWVyeTogc3RyaW5nLCBwcmV2TWVzc2FnZXM6IHN0cmluZ1tdLCB1cmw6IHN0cmluZykge1xuICBsZXQgbGltaXRlZFdlYkNvbnRlbnQgPSB3ZWJDb250ZW50O1xuICAvLyBDaGVjayBpZiB3ZWJDb250ZW50IGlzIHByb3ZpZGVkXG4gIGlmICh3ZWJDb250ZW50Lmxlbmd0aCA+IDUwMDAwMCkge1xuICAgIC8vIExpbWl0IHdlYkNvbnRlbnQgc2l6ZSB0byBwcmV2ZW50IHJlcXVlc3Qgc2l6ZSBpc3N1ZXNcbiAgICBsaW1pdGVkV2ViQ29udGVudCA9IGxpbWl0Q29udGVudFNpemUod2ViQ29udGVudCk7XG4gIH1cblxuICAvLyBzZW5kIGEgbWVzc2FnZSB0byB0aGUgY29udGVudCBzY3JpcHQgdG8gZ2V0IHRoZSB0ZXh0IG9mIHRoZSBjdXJyZW50IHBhZ2VcbiAgY29uc29sZS5sb2coJ1NlbmRpbmcgcXVlcnkgdG8gTGVtbWE6Jywge1xuICAgIHdlYkNvbnRlbnRTaXplOiBsaW1pdGVkV2ViQ29udGVudC5sZW5ndGgsXG4gICAgY29udGVudDogbGltaXRlZFdlYkNvbnRlbnQsXG4gICAgcXVlcnksXG4gICAgcHJldk1lc3NhZ2VzLFxuICAgIHVybFxuICB9KTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCdodHRwOi8vbG9jYWxob3N0OjMwMDEvYXBpL2NoYXQnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB3ZWJDb250ZW50OiBsaW1pdGVkV2ViQ29udGVudCwgcXVlcnksIHByZXZNZXNzYWdlcywgdXJsIH0pLFxuICAgIH0pO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHJlc3BvbnNlIGlzIG9rXG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0hUVFAgZXJyb3I6JywgcmVzLnN0YXR1cywgcmVzLnN0YXR1c1RleHQpO1xuICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gJ0Vycm9yOiBBUEkgZW5kcG9pbnQgbm90IGZvdW5kLiBNYWtlIHN1cmUgdGhlIExlbW1hIHNlcnZlciBpcyBydW5uaW5nIHdpdGggdGhlIGNvcnJlY3Qgcm91dGVzLic7XG4gICAgICB9XG4gICAgICByZXR1cm4gYEVycm9yOiBTZXJ2ZXIgcmVzcG9uZGVkIHdpdGggJHtyZXMuc3RhdHVzfSAke3Jlcy5zdGF0dXNUZXh0fWA7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgcmVzcG9uc2UgaGFzIGNvbnRlbnRcbiAgICBjb25zdCByZXNwb25zZVRleHQgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgIGlmICghcmVzcG9uc2VUZXh0KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFbXB0eSByZXNwb25zZSBmcm9tIHNlcnZlcicpO1xuICAgICAgcmV0dXJuICdFcnJvcjogRW1wdHkgcmVzcG9uc2UgZnJvbSBzZXJ2ZXInO1xuICAgIH1cblxuICAgIC8vIFRyeSB0byBwYXJzZSBKU09OXG4gICAgbGV0IGRhdGE7XG4gICAgdHJ5IHtcbiAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBhcnNlIEpTT04gcmVzcG9uc2U6JywgcmVzcG9uc2VUZXh0KTtcbiAgICAgIHJldHVybiAnRXJyb3I6IEludmFsaWQgcmVzcG9uc2UgZm9ybWF0IGZyb20gc2VydmVyJztcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnUmVzcG9uc2UgZnJvbSBMZW1tYTonLCBkYXRhKTtcbiAgICByZXR1cm4gZGF0YS5hbnN3ZXIgfHwgJ05vIGFuc3dlciByZWNlaXZlZCBmcm9tIHNlcnZlcic7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2FsbGluZyBMZW1tYSBBUEk6JywgZXJyb3IpO1xuICAgIHJldHVybiAnRXJyb3I6IENvdWxkIG5vdCBjb25uZWN0IHRvIExlbW1hJztcbiAgfVxufVxuXG4vLyBiYWNrZ3JvdW5kIHNjcmlwdCB0byBzYXZlIHRoZSBjdXJyZW50IHBhZ2UgYXMgYSBub3RlIGluIHRoZSBMZW1tYSBhcHBsaWNhdGlvblxuLy8gUHJvcHM6IGN1cnJlbnRQYWdlOiB0YWIsIHRpdGxlOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgVVJMOiBzdHJpbmdcbi8vIHJldHVybnM6IHN1Y2Nlc3M6IGJvb2xlYW5cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZU5vdGVUb0xlbW1hKHdlYkNvbnRlbnQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgVVJMOiBzdHJpbmcpIHtcbiAgbGV0IGxpbWl0ZWRXZWJDb250ZW50ID0gd2ViQ29udGVudDtcbiAgLy8gQ2hlY2sgaWYgd2ViQ29udGVudCBpcyBwcm92aWRlZFxuICBpZiAod2ViQ29udGVudC5sZW5ndGggPiA1MDAwMDApIHtcbiAgICAvLyBMaW1pdCB3ZWJDb250ZW50IHNpemUgdG8gcHJldmVudCByZXF1ZXN0IHNpemUgaXNzdWVzXG4gICAgbGltaXRlZFdlYkNvbnRlbnQgPSBsaW1pdENvbnRlbnRTaXplKHdlYkNvbnRlbnQpO1xuICB9XG5cbiAgLy8gc2VuZCBhIG1lc3NhZ2UgdG8gdGhlIGNvbnRlbnQgc2NyaXB0IHRvIHNhdmUgdGhlIG5vdGVcbiAgY29uc29sZS5sb2coJ1NhdmluZyBub3RlIHRvIExlbW1hOicsIHtcbiAgICB3ZWJDb250ZW50U2l6ZTogd2ViQ29udGVudC5sZW5ndGgsXG4gICAgbGltaXRlZFNpemU6IGxpbWl0ZWRXZWJDb250ZW50Lmxlbmd0aCxcbiAgICB0aXRsZSxcbiAgICBVUkxcbiAgfSk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnaHR0cDovL2xvY2FsaG9zdDozMDAxL2FwaS9zYXZlLW5vdGUnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB3ZWJDb250ZW50OiBsaW1pdGVkV2ViQ29udGVudCwgdGl0bGUsIHVybDogVVJMIH0pLFxuICAgIH0pO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHJlc3BvbnNlIGlzIG9rXG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0hUVFAgZXJyb3I6JywgcmVzLnN0YXR1cywgcmVzLnN0YXR1c1RleHQpO1xuICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvcjogQVBJIGVuZHBvaW50IG5vdCBmb3VuZC4gTWFrZSBzdXJlIHRoZSBMZW1tYSBzZXJ2ZXIgaXMgcnVubmluZyB3aXRoIHRoZSBjb3JyZWN0IHJvdXRlcy4nKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFNlcnZlciByZXNwb25kZWQgd2l0aCAke3Jlcy5zdGF0dXN9ICR7cmVzLnN0YXR1c1RleHR9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgcmVzcG9uc2UgaGFzIGNvbnRlbnRcbiAgICBjb25zdCByZXNwb25zZVRleHQgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgIGlmICghcmVzcG9uc2VUZXh0KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFbXB0eSByZXNwb25zZSBmcm9tIHNlcnZlcicpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRyeSB0byBwYXJzZSBKU09OXG4gICAgbGV0IGRhdGE7XG4gICAgdHJ5IHtcbiAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBhcnNlIEpTT04gcmVzcG9uc2U6JywgcmVzcG9uc2VUZXh0KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnUmVzcG9uc2UgZnJvbSBMZW1tYSBzYXZlLW5vdGU6JywgZGF0YSk7XG4gICAgcmV0dXJuIGRhdGEuc3VjY2VzcyAhPT0gZmFsc2U7IC8vIFJldHVybiB0cnVlIHVubGVzcyBleHBsaWNpdGx5IGZhbHNlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2FsbGluZyBMZW1tYSBzYXZlLW5vdGUgQVBJOicsIGVycm9yKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuIiwiLy8gc3JjL2luZGV4LnRzXG52YXIgX01hdGNoUGF0dGVybiA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IobWF0Y2hQYXR0ZXJuKSB7XG4gICAgaWYgKG1hdGNoUGF0dGVybiA9PT0gXCI8YWxsX3VybHM+XCIpIHtcbiAgICAgIHRoaXMuaXNBbGxVcmxzID0gdHJ1ZTtcbiAgICAgIHRoaXMucHJvdG9jb2xNYXRjaGVzID0gWy4uLl9NYXRjaFBhdHRlcm4uUFJPVE9DT0xTXTtcbiAgICAgIHRoaXMuaG9zdG5hbWVNYXRjaCA9IFwiKlwiO1xuICAgICAgdGhpcy5wYXRobmFtZU1hdGNoID0gXCIqXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGdyb3VwcyA9IC8oLiopOlxcL1xcLyguKj8pKFxcLy4qKS8uZXhlYyhtYXRjaFBhdHRlcm4pO1xuICAgICAgaWYgKGdyb3VwcyA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihtYXRjaFBhdHRlcm4sIFwiSW5jb3JyZWN0IGZvcm1hdFwiKTtcbiAgICAgIGNvbnN0IFtfLCBwcm90b2NvbCwgaG9zdG5hbWUsIHBhdGhuYW1lXSA9IGdyb3VwcztcbiAgICAgIHZhbGlkYXRlUHJvdG9jb2wobWF0Y2hQYXR0ZXJuLCBwcm90b2NvbCk7XG4gICAgICB2YWxpZGF0ZUhvc3RuYW1lKG1hdGNoUGF0dGVybiwgaG9zdG5hbWUpO1xuICAgICAgdmFsaWRhdGVQYXRobmFtZShtYXRjaFBhdHRlcm4sIHBhdGhuYW1lKTtcbiAgICAgIHRoaXMucHJvdG9jb2xNYXRjaGVzID0gcHJvdG9jb2wgPT09IFwiKlwiID8gW1wiaHR0cFwiLCBcImh0dHBzXCJdIDogW3Byb3RvY29sXTtcbiAgICAgIHRoaXMuaG9zdG5hbWVNYXRjaCA9IGhvc3RuYW1lO1xuICAgICAgdGhpcy5wYXRobmFtZU1hdGNoID0gcGF0aG5hbWU7XG4gICAgfVxuICB9XG4gIGluY2x1ZGVzKHVybCkge1xuICAgIGlmICh0aGlzLmlzQWxsVXJscylcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGNvbnN0IHUgPSB0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiID8gbmV3IFVSTCh1cmwpIDogdXJsIGluc3RhbmNlb2YgTG9jYXRpb24gPyBuZXcgVVJMKHVybC5ocmVmKSA6IHVybDtcbiAgICByZXR1cm4gISF0aGlzLnByb3RvY29sTWF0Y2hlcy5maW5kKChwcm90b2NvbCkgPT4ge1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImh0dHBcIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNIdHRwTWF0Y2godSk7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiaHR0cHNcIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNIdHRwc01hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImZpbGVcIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGaWxlTWF0Y2godSk7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiZnRwXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzRnRwTWF0Y2godSk7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwidXJuXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzVXJuTWF0Y2godSk7XG4gICAgfSk7XG4gIH1cbiAgaXNIdHRwTWF0Y2godXJsKSB7XG4gICAgcmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwOlwiICYmIHRoaXMuaXNIb3N0UGF0aE1hdGNoKHVybCk7XG4gIH1cbiAgaXNIdHRwc01hdGNoKHVybCkge1xuICAgIHJldHVybiB1cmwucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcbiAgfVxuICBpc0hvc3RQYXRoTWF0Y2godXJsKSB7XG4gICAgaWYgKCF0aGlzLmhvc3RuYW1lTWF0Y2ggfHwgIXRoaXMucGF0aG5hbWVNYXRjaClcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBob3N0bmFtZU1hdGNoUmVnZXhzID0gW1xuICAgICAgdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5ob3N0bmFtZU1hdGNoKSxcbiAgICAgIHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMuaG9zdG5hbWVNYXRjaC5yZXBsYWNlKC9eXFwqXFwuLywgXCJcIikpXG4gICAgXTtcbiAgICBjb25zdCBwYXRobmFtZU1hdGNoUmVnZXggPSB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLnBhdGhuYW1lTWF0Y2gpO1xuICAgIHJldHVybiAhIWhvc3RuYW1lTWF0Y2hSZWdleHMuZmluZCgocmVnZXgpID0+IHJlZ2V4LnRlc3QodXJsLmhvc3RuYW1lKSkgJiYgcGF0aG5hbWVNYXRjaFJlZ2V4LnRlc3QodXJsLnBhdGhuYW1lKTtcbiAgfVxuICBpc0ZpbGVNYXRjaCh1cmwpIHtcbiAgICB0aHJvdyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZDogZmlsZTovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgaXNGdHBNYXRjaCh1cmwpIHtcbiAgICB0aHJvdyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZDogZnRwOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBpc1Vybk1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiB1cm46Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGNvbnZlcnRQYXR0ZXJuVG9SZWdleChwYXR0ZXJuKSB7XG4gICAgY29uc3QgZXNjYXBlZCA9IHRoaXMuZXNjYXBlRm9yUmVnZXgocGF0dGVybik7XG4gICAgY29uc3Qgc3RhcnNSZXBsYWNlZCA9IGVzY2FwZWQucmVwbGFjZSgvXFxcXFxcKi9nLCBcIi4qXCIpO1xuICAgIHJldHVybiBSZWdFeHAoYF4ke3N0YXJzUmVwbGFjZWR9JGApO1xuICB9XG4gIGVzY2FwZUZvclJlZ2V4KHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csIFwiXFxcXCQmXCIpO1xuICB9XG59O1xudmFyIE1hdGNoUGF0dGVybiA9IF9NYXRjaFBhdHRlcm47XG5NYXRjaFBhdHRlcm4uUFJPVE9DT0xTID0gW1wiaHR0cFwiLCBcImh0dHBzXCIsIFwiZmlsZVwiLCBcImZ0cFwiLCBcInVyblwiXTtcbnZhciBJbnZhbGlkTWF0Y2hQYXR0ZXJuID0gY2xhc3MgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1hdGNoUGF0dGVybiwgcmVhc29uKSB7XG4gICAgc3VwZXIoYEludmFsaWQgbWF0Y2ggcGF0dGVybiBcIiR7bWF0Y2hQYXR0ZXJufVwiOiAke3JlYXNvbn1gKTtcbiAgfVxufTtcbmZ1bmN0aW9uIHZhbGlkYXRlUHJvdG9jb2wobWF0Y2hQYXR0ZXJuLCBwcm90b2NvbCkge1xuICBpZiAoIU1hdGNoUGF0dGVybi5QUk9UT0NPTFMuaW5jbHVkZXMocHJvdG9jb2wpICYmIHByb3RvY29sICE9PSBcIipcIilcbiAgICB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihcbiAgICAgIG1hdGNoUGF0dGVybixcbiAgICAgIGAke3Byb3RvY29sfSBub3QgYSB2YWxpZCBwcm90b2NvbCAoJHtNYXRjaFBhdHRlcm4uUFJPVE9DT0xTLmpvaW4oXCIsIFwiKX0pYFxuICAgICk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZUhvc3RuYW1lKG1hdGNoUGF0dGVybiwgaG9zdG5hbWUpIHtcbiAgaWYgKGhvc3RuYW1lLmluY2x1ZGVzKFwiOlwiKSlcbiAgICB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihtYXRjaFBhdHRlcm4sIGBIb3N0bmFtZSBjYW5ub3QgaW5jbHVkZSBhIHBvcnRgKTtcbiAgaWYgKGhvc3RuYW1lLmluY2x1ZGVzKFwiKlwiKSAmJiBob3N0bmFtZS5sZW5ndGggPiAxICYmICFob3N0bmFtZS5zdGFydHNXaXRoKFwiKi5cIikpXG4gICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4oXG4gICAgICBtYXRjaFBhdHRlcm4sXG4gICAgICBgSWYgdXNpbmcgYSB3aWxkY2FyZCAoKiksIGl0IG11c3QgZ28gYXQgdGhlIHN0YXJ0IG9mIHRoZSBob3N0bmFtZWBcbiAgICApO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVQYXRobmFtZShtYXRjaFBhdHRlcm4sIHBhdGhuYW1lKSB7XG4gIHJldHVybjtcbn1cbmV4cG9ydCB7XG4gIEludmFsaWRNYXRjaFBhdHRlcm4sXG4gIE1hdGNoUGF0dGVyblxufTtcbiJdLCJuYW1lcyI6WyJicm93c2VyIiwiX2Jyb3dzZXIiLCJfYSIsIlVSTCJdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sV0FBUyxpQkFBaUIsS0FBSztBQUNwQyxRQUFJLE9BQU8sUUFBUSxPQUFPLFFBQVEsV0FBWSxRQUFPLEVBQUUsTUFBTSxJQUFLO0FBQ2xFLFdBQU87QUFBQSxFQUNUO0FDRk8sUUFBTUEsY0FBVSxzQkFBVyxZQUFYLG1CQUFvQixZQUFwQixtQkFBNkIsTUFDaEQsV0FBVyxVQUNYLFdBQVc7QUNGUixRQUFNLFVBQVVDO0FDQXZCLFFBQUEsYUFBQSxpQkFBQSxNQUFBO0FBQ0UsWUFBQSxJQUFBLHFC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TUFDbkU7QUFDRCxZQUFNLHFCQUFxQixLQUFLLHNCQUFzQixLQUFLLGFBQWE7QUFDeEUsYUFBTyxDQUFDLENBQUMsb0JBQW9CLEtBQUssQ0FBQyxVQUFVLE1BQU0sS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLG1CQUFtQixLQUFLLElBQUksUUFBUTtBQUFBLElBQ2xIO0FBQUEsSUFDRSxZQUFZLEtBQUs7QUFDZixZQUFNLE1BQU0scUVBQXFFO0FBQUEsSUFDckY7QUFBQSxJQUNFLFdBQVcsS0FBSztBQUNkLFlBQU0sTUFBTSxvRUFBb0U7QUFBQSxJQUNwRjtBQUFBLElBQ0UsV0FBVyxLQUFLO0FBQ2QsWUFBTSxNQUFNLG9FQUFvRTtBQUFBLElBQ3BGO0FBQUEsSUFDRSxzQkFBc0IsU0FBUztBQUM3QixZQUFNLFVBQVUsS0FBSyxlQUFlLE9BQU87QUFDM0MsWUFBTSxnQkFBZ0IsUUFBUSxRQUFRLFNBQVMsSUFBSTtBQUNuRCxhQUFPLE9BQU8sSUFBSSxhQUFhLEdBQUc7QUFBQSxJQUN0QztBQUFBLElBQ0UsZUFBZSxRQUFRO0FBQ3JCLGFBQU8sT0FBTyxRQUFRLHVCQUF1QixNQUFNO0FBQUEsSUFDdkQ7QUFBQSxFQUNBO0FBQ0EsTUFBSSxlQUFlO0FBQ25CLGVBQWEsWUFBWSxDQUFDLFFBQVEsU0FBUyxRQUFRLE9BQU8sS0FBSztBQUMvRCxNQUFJLHNCQUFzQixjQUFjLE1BQU07QUFBQSxJQUM1QyxZQUFZLGNBQWMsUUFBUTtBQUNoQyxZQUFNLDBCQUEwQixZQUFZLE1BQU0sTUFBTSxFQUFFO0FBQUEsSUFDOUQ7QUFBQSxFQUNBO0FBQ0EsV0FBUyxpQkFBaUIsY0FBYyxVQUFVO0FBQ2hELFFBQUksQ0FBQyxhQUFhLFVBQVUsU0FBUyxRQUFRLEtBQUssYUFBYTtBQUM3RCxZQUFNLElBQUk7QUFBQSxRQUNSO0FBQUEsUUFDQSxHQUFHLFFBQVEsMEJBQTBCLGFBQWEsVUFBVSxLQUFLLElBQUksQ0FBQztBQUFBLE1BQ3ZFO0FBQUEsRUFDTDtBQUNBLFdBQVMsaUJBQWlCLGNBQWMsVUFBVTtBQUNoRCxRQUFJLFNBQVMsU0FBUyxHQUFHO0FBQ3ZCLFlBQU0sSUFBSSxvQkFBb0IsY0FBYyxnQ0FBZ0M7QUFDOUUsUUFBSSxTQUFTLFNBQVMsR0FBRyxLQUFLLFNBQVMsU0FBUyxLQUFLLENBQUMsU0FBUyxXQUFXLElBQUk7QUFDNUUsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxNQUNEO0FBQUEsRUFDTDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMCwxLDIsNF19
