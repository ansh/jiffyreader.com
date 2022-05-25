// making half of the letters in a word bold
function highlightText (sentenceText) {
  return sentenceText
    .replace(/\p{L}+/gu, (word) => {
      const { length } = word;
      let midPoint = 1;
      if (length > 3) midPoint = Math.round(length / 2);
      const firstHalf = word.slice(0, midPoint);
      const secondHalf = word.slice(midPoint);
      const htmlWord = `<br-bold class="br-bold">${firstHalf}</br-bold>${secondHalf}`;
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
        element.classList.toggle('br-bold');
        document.body.classList.toggle('br-bold');
      }
    }
    else if(enableReading == false){
      for (const element of boldedElements) {
        element.classList.remove('br-bold');
        document.body.classList.remove('br-bold');
      }
    }
    else{
      for (const element of boldedElements) {
        element.classList.add('br-bold');
        document.body.classList.add('br-bold');
      }
    }
    return;
  }
  
  if(enableReading == false)
  {
    return;
  }
  document.body.classList.add('br-bold');
  const tags = ['p', 'font', 'span', 'li'];
  const parser = new DOMParser();
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
  });
  
};

const onChromeRuntimeMessage = (message) => {
  console.log("Got msge in content script as =>", message)
  switch (message["type"]) {
    case "toggleReadingMode": {
      ToggleReading();
      break;
    }
    case "setReadingMode": {
      ToggleReading(message["data"]);
      break;
    }
    case "setSaccadesIntervalInDOM": {
      const saccadesInterval =  message["data"] == null ? 0 : message["data"];
      document.body.setAttribute('saccades-interval', saccadesInterval);
      break;
    }
    case "setlineHeight": {
      const action = message["action"];
      const step =  message["step"];
      const LINE_HEIGHT_KEY = "--br-line-height";
      let currentHeight = document.body.style.getPropertyValue(LINE_HEIGHT_KEY);
      switch (action) {
        case 'lineHeightdecrease':
          currentHeight = /\d+/.test(currentHeight) && currentHeight > 1 ? Number(currentHeight) - step : currentHeight;
          break;
    
        case 'lineHeightIncrease':
          currentHeight = /\d+/.test(currentHeight) ? Number(currentHeight) : 1;
          currentHeight += step;
          break;
    
        case 'lineHeightReset':
          currentHeight = '';
          break;
    
        default:
          break;
      }
      console.log("Setting currentHeight : ", currentHeight);
      if (/\d+/.test(currentHeight)) {
        document.body.style.setProperty(LINE_HEIGHT_KEY, currentHeight);
      } else {
        document.body.style.removeProperty(LINE_HEIGHT_KEY);
      }
      break;
    }
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
  style.textContent = `
    .br-bold :is(
      [saccades-interval="0"] br-bold, 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1),
      [saccades-interval="2"] br-bold:nth-of-type(3n+1),
      [saccades-interval="3"] br-bold:nth-of-type(4n+1),
      [saccades-interval="4"] br-bold:nth-of-type(5n+1)
      ) { 
      font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); 
    }
    `;
  document.head.appendChild(style);

  const runTimeHandler = typeof browser === "undefined"?chrome:browser;

  runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);
  runTimeHandler.runtime.sendMessage(
    { message: "getToggleOnDefault" },
    function (response) {
      console.log("getToggleOnDefault response=> ", response);
      ToggleReading(response["data"] == "true"?true:false);
    }
  );
  runTimeHandler.runtime.sendMessage(
    { message: "getSaccadesInterval" },
    function (response) {
      console.log("getSaccadesInterval response=> ", response);
      const saccadesInterval =  response == undefined || response["data"] == null ? 0 : response["data"];
      document.body.setAttribute('saccades-interval', saccadesInterval);
    }
  );
});

