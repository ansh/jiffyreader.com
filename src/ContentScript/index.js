// making half of the letters in a word bold
function highlightText(sentenceText) {
  return sentenceText
    .replace(/\p{L}+/gu, (word) => {
      const { length } = word;
      let midPoint = 1;
      if (length > 3) midPoint = Math.round(length / 2);
      const firstHalf = word.slice(0, midPoint);
      const secondHalf = word.slice(midPoint);
      const htmlWord = `<br-bold>${firstHalf}</br-bold>${secondHalf}`;
      return htmlWord;
    });
}

const ToggleReading = (enableReading) => {
  console.log("enableReading =>", enableReading);
  const boldedElements = document.getElementsByTagName('br-bold')
  if (boldedElements.length > 0){
    if(typeof enableReading == undefined || enableReading == undefined )
    {
      for (const element of boldedElements) {
        element.classList.toggle('br-bold')
      }
    }
    else if(enableReading == false){
      for (const element of boldedElements) {
        element.classList.remove('br-bold');
      }
    }
    else{
      for (const element of boldedElements) {
        element.classList.add('br-bold');
      }
    }
    console.log("I am returning from here");
    return;
  }
  
  if(enableReading == false)
  {
    return;
  }
  
  let tags = ['p', 'font', 'span', 'li']
  const parser = new DOMParser()
  tags.forEach((tag) => {
    for (const element of document.getElementsByTagName(tag)) {
      const n = parser.parseFromString(element.innerHTML, 'text/html');
      const textArrTransformed = Array.from(n.body.childNodes).map((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return highlightText(node.nodeValue);
        }
        return node.outerHTML;
      });
      element.innerHTML = textArrTransformed.join(' ');
    }
  })
};

const onChromeRuntimeMessage = (message) => {
  if (
    message.hasOwnProperty("type") &&
    message["type"] == "toggleReadingMode"
  ) {
    console.log("Got msge in content script as =>", message)
    ToggleReading();
  }
  else if (
    message.hasOwnProperty("type") &&
    message["type"] == "setReadingMode"
  ) {
    console.log("Got msge in content script as =>", message)
    ToggleReading(message["data"]);
  }
};

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(async () => {
  var style = document.createElement('style')
  style.textContent = '.br-bold { font-weight: bold !important; display: inline; }'
  document.head.appendChild(style)
  chrome.runtime.onMessage.addListener(onChromeRuntimeMessage);
  chrome.storage.sync.get('toggleOnDefault', ({ toggleOnDefault }) => {
    console.log("Got toggleOnDefault value => ",toggleOnDefault);
    ToggleReading(typeof toggleOnDefault == undefined?false:toggleOnDefault);
  })
});

