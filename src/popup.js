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
  chrome.storage.sync.get("color", async ({ color }) => {

    // setting global styles
    var style = document.createElement("style");
    style.textContent =
      `bionic-reading-bold {
        font-weight: bold !important;
      }
      bionic-reading-extra-bold {
        font-weight: bold !important;
        text-shadow:0px 0px 1px black;
      }`
    document.head.appendChild(style);

    let tags = ["p", "font", "span"];

    tags.forEach((element) => {
      pList = document.getElementsByTagName(element);
      // making half of the letters in a word bold
      for (let sentence of pList) {
        const sentenceText = sentence.innerText;
        const fontWeight = getComputedStyle(sentence).fontWeight || 0
        const textArr = sentenceText.split(" ");
        const textArrTransformed = textArr.map((word) => {
          const length = word.length;
          const midPoint = Math.round(length / 2);
          const firstHalf = word.slice(0, midPoint);
          const secondHalf = word.slice(midPoint);
          if (fontWeight < 700) {
            return `<bionic-reading-bold>${firstHalf}</bionic-reading-bold>${secondHalf}`;
          } else {
            return `<bionic-reading-extra-bold>${firstHalf}</bionic-reading-extra-bold>${secondHalf}`;
          }
        });
        sentence.innerHTML = textArrTransformed.join(" ");
      }
    });

  });
}
