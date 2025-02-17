console.log("Background script loaded");

// Initialize filter state
let isFilterEnabled = true;

// Store initial state
browser.storage.local.set({ filterEnabled: isFilterEnabled });

// Function to set filter state
async function setFilterState(enabled) {
  isFilterEnabled = enabled;

  // Store new state
  await browser.storage.local.set({ filterEnabled: isFilterEnabled });

  // Notify all tabs of the state change
  const tabs = await browser.tabs.query({});
  tabs.forEach(tab => {
    browser.tabs.sendMessage(tab.id, {
      action: "toggleFilter",
      enabled: isFilterEnabled
    }).catch(err => console.log(`Could not send message to tab ${tab.id}:`, err));
  });
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message);
  if (message.action === "keywordsUpdated") {
    browser.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        console.log("Sending updateKeywords message to tab:", tab.id);
        browser.tabs.sendMessage(tab.id, { action: "updateKeywords", keywords: message.keywords });
      });
    });
  } else if (message.action === "setFilter") {
    setFilterState(message.enabled);
  }
});

// Apply keywords to new tabs
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log("New tab completed loading. Sending keywords.");
    browser.storage.local.get("keywords", (data) => {
      browser.tabs.sendMessage(tabId, {
        action: "updateKeywords",
        keywords: data.keywords || []
      });
    });
    // Send current filter state
    browser.tabs.sendMessage(tabId, {
      action: "toggleFilter",
      enabled: isFilterEnabled
    });
  }
});
