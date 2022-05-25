const runTimeHandler = typeof browser === "undefined"?chrome:browser;

const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');

runTimeHandler.runtime.sendMessage(
  { message: "getSaccadesInterval" },
  function (response) {
    console.log("getSaccadesInterval response in POP up=> ", response);
    
    const saccadesInterval =  response == undefined || response["data"] == null ? 0 : response["data"];
    const documentButtons = document.getElementsByTagName('button');
    for (let index = 0; index < documentButtons.length; index++) {
      const button = documentButtons.item(index);

      const buttonId = button.getAttribute('id');
      if (/lineHeight/.test(buttonId)) {
        button.addEventListener('click', updateLineHeightClickHandler);
      }
    }

    updateSaccadesLabelValue(saccadesInterval);
    saccadesIntervalSlider.value = saccadesInterval;
    saccadesIntervalSlider.addEventListener('change', updateSaccadesChangeHandler);
  }
);

runTimeHandler.runtime.sendMessage(
  { message: "getToggleOnDefault" },
  function (response) {
    console.log("getToggleOnDefault response in POP up=> ", response);
    toggleOnDefaultCheckbox.checked = response["data"] == "true"?true:false;
  }
);

toggleBtn.addEventListener('click', async () => {
  chrome.tabs.query({ active: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "toggleReadingMode", data: undefined },
      () => {
        if (runTimeHandler.runtime.lastError) {
        }
      }
    );
  });
});

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  runTimeHandler.runtime.sendMessage(
    { message: "setToggleOnDefault", data: event.target.checked},
    function (response) {
    }
  );  
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      return new Promise(() => {
        try {
          
          chrome.tabs.sendMessage(
            tab.id,
            { type: "setReadingMode", data: event.target.checked },
            () => {
              if (runTimeHandler.runtime.lastError) {
              }
            }
          );
        } catch (e) {}
      });
    });
  });
});

async function updateLineHeightClickHandler(event) {
  console.log("updateLineHeightClickHandler event=>", event);
  /*const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    function: updateLineHeightActiveTab,
    args: [{ action: event.target.getAttribute('id'), LINE_HEIGHT_KEY: '--br-line-height', STEP: 0.5 }],
  });*/
  //TODO
}

function updateSaccadesChangeHandler(event) {
  const saccadesInterval = Number(event.target.value);
  updateSaccadesLabelValue(saccadesInterval);
  updateSaccadesIntermediateHandler(saccadesInterval);
}

async function updateSaccadesIntermediateHandler(_saccadesInterval) {
  console.log("_saccadesInterval=>", _saccadesInterval);
  runTimeHandler.runtime.sendMessage(
    { message: "setSaccadesInterval", data: _saccadesInterval},
    function (response) {
    }
  );
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      return new Promise(() => {
        try {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "setSaccadesIntervalInDOM", data: _saccadesInterval },
            () => {
              if (runTimeHandler.runtime.lastError) {
              }
            }
          );
        } catch (e) {}
      });
    });
  });
  /*const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      function: (saccadesInterval) => { document.body.setAttribute('saccades-interval', saccadesInterval); return saccadesInterval; },
      args: [_saccadesInterval],
    },
    ([activeFrame]) => {
      chrome.storage.sync.set({ saccadesInterval: activeFrame.result });
    },
  );*/
  //TODO
}

function updateLineHeightActiveTab({ action, LINE_HEIGHT_KEY, STEP }) {
  console.log("updateLineHeightActiveTab => ", action, " LINE_HEIGHT_KEY :", LINE_HEIGHT_KEY, " STEP: ", STEP)
  let currentHeight = document.body.style.getPropertyValue(LINE_HEIGHT_KEY);

  switch (action) {
    case 'lineHeightdecrease':
      currentHeight = /\d+/.test(currentHeight) && currentHeight > 1 ? Number(currentHeight) - STEP : currentHeight;
      break;

    case 'lineHeightIncrease':
      currentHeight = /\d+/.test(currentHeight) ? Number(currentHeight) : 1;
      currentHeight += STEP;
      break;

    case 'lineHeightReset':
      currentHeight = '';
      break;

    default:
      break;
  }

  if (/\d+/.test(currentHeight)) {
    document.body.style.setProperty(LINE_HEIGHT_KEY, currentHeight);
  } else {
    document.body.style.removeProperty(LINE_HEIGHT_KEY);
  }
}

/**
 * @description Show the word interval between saccades
 */
function updateSaccadesLabelValue(saccadesInterval) {
  document.getElementById('saccadesLabelValue').textContent = saccadesInterval;
}