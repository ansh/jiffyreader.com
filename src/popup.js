// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject convertToReadbaleText into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: convertToReadbaleText,
  });
});

// The body of this function will be executed as a content script inside the current page
function convertToReadbaleText() {
	// making half of the letters in a word bold
	function highlightText(sentenceText) {
    return sentenceText
      .split(' ')
      .map((word) => {
        const length = word.length
        const midPoint = Math.round(length / 2)
        const firstHalf = word.slice(0, midPoint)
        const secondHalf = word.slice(midPoint)
        const htmlWord = `<b>${firstHalf}</b>${secondHalf}`
        return htmlWord
      })
      .join(' ')
  }

	chrome.storage.sync.get('color', async ({ color }) => {
    // setting global styles
    var style = document.createElement('style')
    style.textContent = 'b { font-weight: bold !important; }'
    document.head.appendChild(style)

    let tags = ['p', 'font', 'span', 'li']

    const parser = new DOMParser()
    tags.forEach((tag) => {
      for (let element of document.getElementsByTagName(tag)) {
        const n = parser.parseFromString(element.innerHTML, 'text/html')
        const textArrTransformed = Array.from(n.body.childNodes).map((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return highlightText(node.nodeValue)
          }
          return node.outerHTML
        })
        element.innerHTML = textArrTransformed.join(' ')
      }
    })
  })
}
