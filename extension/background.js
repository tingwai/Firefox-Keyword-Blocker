console.log("Background script loaded");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message);
  if (message.action === "keywordsUpdated") {
    browser.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        console.log("Sending updateKeywords message to tab:", tab.id);
        browser.tabs.sendMessage(tab.id, { action: "updateKeywords", keywords: message.keywords });
      });
    });
  }
});

// Apply keywords to new tabs
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log("New tab completed loading. Sending keywords.");
    browser.storage.local.get("keywords", (data) => {
      browser.tabs.sendMessage(tabId, { action: "updateKeywords", keywords: data.keywords || [] });
    });
  }
});
