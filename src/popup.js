// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", async ({ color }) => {
    // setting up pList
    let pList;
    let option1 = document.getElementsByTagName("p");
    let option2 = document.getElementsByTagName("font");
    if (option1.length > option2.length) {
      pList = option1;
    } else {
      pList = option2;
    }
    
    // setting global styles
    var style = document.createElement("style");
    style.textContent = "b { font-weight: bold; !important }";
    document.head.appendChild(style);


    // making half of the letters in a word bold 
    for (let sentence of pList) {
      const sentenceText = sentence.innerText;
      const textArr = sentenceText.split(" ");
      const textArrTransformed = textArr.map((word) => {
        const length = word.length;
        const midPoint = Math.round(length / 2);
        const firstHalf = word.slice(0, midPoint);
        const secondHalf = word.slice(midPoint);
        const htmlWord = `<b>${firstHalf}</b>${secondHalf}`;
        return htmlWord;
      });
      console.log();
      sentence.innerHTML = textArrTransformed.join(" ");
    }

    // document.body.style.backgroundColor = color;
  });
}
