let keywords = [];
let isFilterEnabled = true;

function hideElements() {
  // Don't hide elements if filter is disabled
  if (!isFilterEnabled) {
    return;
  }

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
  // Store the original display value if not already stored
  if (!element.dataset.originalDisplay) {
    element.dataset.originalDisplay = element.style.display || '';
  }

  element.style.display = 'none';

  // Find and hide the closest container (usually a div or similar)
  let container = element.closest('div, article, section, .post, .thread');
  if (container && container !== document.body) {
    if (!container.dataset.originalDisplay) {
      container.dataset.originalDisplay = container.style.display || '';
    }
    container.style.display = 'none';
  }

  // Find and hide associated media
  const media = findAssociatedMedia(container || element);
  if (media) {
    if (!media.dataset.originalDisplay) {
      media.dataset.originalDisplay = media.style.display || '';
    }
    media.style.display = 'none';
  }

  // Try to find and hide associated description
  let nextSibling = container ? container.nextElementSibling : element.nextElementSibling;
  if (nextSibling && nextSibling.tagName.toLowerCase() === 'p') {
    if (!nextSibling.dataset.originalDisplay) {
      nextSibling.dataset.originalDisplay = nextSibling.style.display || '';
    }
    nextSibling.style.display = 'none';
  }
}

// Add function to show hidden elements
function showHiddenElements() {
  const elements = document.querySelectorAll('[data-original-display]');
  elements.forEach(element => {
    element.style.display = element.dataset.originalDisplay;
  });
}

function updateKeywords(newKeywords) {
  console.log("Updating keywords:", newKeywords);
  keywords = newKeywords;
  if (isFilterEnabled) {
    hideElements();
  }
}

function handleFilterToggle(enabled) {
  isFilterEnabled = enabled;
  if (isFilterEnabled) {
    hideElements();
  } else {
    showHiddenElements();
  }
}

// Load initial keywords
browser.storage.local.get("keywords", (data) => {
  console.log("Initial keywords load:", data.keywords);
  updateKeywords(data.keywords || []);
});

// Listen for keyword updates and filter state changes
browser.runtime.onMessage.addListener((message) => {
  console.log("Received message:", message);
  if (message.action === "updateKeywords") {
    updateKeywords(message.keywords);
  } else if (message.action === "toggleFilter") {
    handleFilterToggle(message.enabled);
  }
});

// Run hideElements when the page loads and whenever it's updated
window.addEventListener('load', hideElements);
document.addEventListener('DOMContentLoaded', hideElements);

// Use a MutationObserver to watch for DOM changes
const observer = new MutationObserver(hideElements);
observer.observe(document.body, { childList: true, subtree: true });

console.log("Content script loaded and running");
