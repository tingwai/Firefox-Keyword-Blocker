let keywords = [];

function hideElements() {
  console.log("Hiding elements. Current keywords:", keywords);
  const elements = document.body.getElementsByTagName('*');
  let hiddenCount = 0;

  for (let element of elements) {
    if (shouldHideElement(element)) {
      hideElementAndItsContent(element);
      hiddenCount++;
    }
  }

  console.log(`Hidden ${hiddenCount} elements`);
}

function shouldHideElement(element) {
  const text = element.textContent.toLowerCase();
  return keywords.some(keyword => text.includes(keyword.toLowerCase())) &&
         (element.childElementCount === 0 || element.classList.contains('post') || element.classList.contains('thread'));
}

function findAssociatedMedia(element) {
  // Check for direct child media elements
  let media = element.querySelector('img, video, audio');
  
  if (!media) {
    // Check for media in parent or sibling elements
    const parent = element.parentElement;
    const siblings = [...parent.children];
    media = siblings.find(sibling => 
      sibling.tagName.toLowerCase() === 'img' || 
      sibling.tagName.toLowerCase() === 'video' ||
      sibling.tagName.toLowerCase() === 'audio'
    );
  }
  
  return media;
}

function hideElementAndItsContent(element) {
  // Hide the element itself
  element.style.display = 'none';

  // Find and hide the closest container (usually a div or similar)
  let container = element.closest('div, article, section, .post, .thread');
  if (container && container !== document.body) {
    container.style.display = 'none';
  }

  // Find and hide associated media
  const media = findAssociatedMedia(container || element);
  if (media) {
    media.style.display = 'none';
  }

  // Try to find and hide associated description
  let nextSibling = container ? container.nextElementSibling : element.nextElementSibling;
  if (nextSibling && nextSibling.tagName.toLowerCase() === 'p') {
    nextSibling.style.display = 'none';
  }
}

function updateKeywords(newKeywords) {
  console.log("Updating keywords:", newKeywords);
  keywords = newKeywords;
  hideElements();
}

// Load initial keywords
browser.storage.local.get("keywords", (data) => {
  console.log("Initial keywords load:", data.keywords);
  updateKeywords(data.keywords || []);
});

// Listen for keyword updates
browser.runtime.onMessage.addListener((message) => {
  console.log("Received message:", message);
  if (message.action === "updateKeywords") {
    updateKeywords(message.keywords);
  }
});

// Run hideElements when the page loads and whenever it's updated
window.addEventListener('load', hideElements);
document.addEventListener('DOMContentLoaded', hideElements);

// Use a MutationObserver to watch for DOM changes
const observer = new MutationObserver(hideElements);
observer.observe(document.body, { childList: true, subtree: true });

console.log("Content script loaded and running");
