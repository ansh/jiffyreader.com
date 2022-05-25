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
  chrome.tabs.query({ active: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "setlineHeight", action:event.target.getAttribute('id'), step:0.5 },
      () => {
        if (runTimeHandler.runtime.lastError) {
        }
      }
    );
  });
}

function updateSaccadesChangeHandler(event) {
  const saccadesInterval = Number(event.target.value);
  updateSaccadesLabelValue(saccadesInterval);
  updateSaccadesIntermediateHandler(saccadesInterval);
}

async function updateSaccadesIntermediateHandler(_saccadesInterval) {
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
}

/**
 * @description Show the word interval between saccades
 */
function updateSaccadesLabelValue(saccadesInterval) {
  document.getElementById('saccadesLabelValue').textContent = saccadesInterval;
}