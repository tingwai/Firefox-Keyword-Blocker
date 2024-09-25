document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('keywords');
  const applyButton = document.getElementById('apply');
  const statusDiv = document.getElementById('status');

  function updateStatus(message) {
    statusDiv.textContent = message;
    console.log(message);
  }

  // Load existing keywords
  browser.storage.local.get("keywords", (data) => {
    updateStatus("Loading keywords...");
    const keywords = data.keywords || [];
    textarea.value = keywords.join(', ');
    updateStatus(`Loaded ${keywords.length} keywords: ${keywords.join(', ')}`);
  });

  // Save keywords when Apply is clicked
  applyButton.addEventListener('click', () => {
    const keywords = textarea.value.split(',').map(k => k.trim()).filter(k => k);
    updateStatus("Saving keywords...");
    browser.storage.local.set({ keywords: keywords }, () => {
      if (browser.runtime.lastError) {
        updateStatus(`Error saving keywords: ${browser.runtime.lastError.message}`);
      } else {
        browser.runtime.sendMessage({ action: "keywordsUpdated", keywords: keywords });
        updateStatus(`Saved ${keywords.length} keywords: ${keywords.join(', ')}`);
      }
    });
  });
});
