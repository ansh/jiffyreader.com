const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');
const fixationStrengthSlider = document.getElementById('fixationStrengthSlider');
const fixationStrengthLabelValue = document.getElementById('fixationStrengthLabelValue');
const toggledListBtn = document.getElementById('toggledListBtn');
const toggledOnListEl = document.getElementById('toggledOnList');
let toggledOnList = {};

chrome.runtime.sendMessage(
  { message: 'getSaccadesInterval' },
  (response) => {
    const saccadesInterval = response === undefined || response.data == null ? 0 : response.data;
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
  },
);

chrome.runtime.sendMessage(
  { message: 'getToggleOnDefault' },
  (response) => {
    toggleOnDefaultCheckbox.checked = response.data === 'true';
  },
);

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  chrome.tabs.sendMessage(tab.id, {
    message: 'getBrMode', type: 'getBrMode',
  }, (request) => {
    setBrModeOnBody(request.data);
  });
});

chrome.runtime.sendMessage({ type: 'getFixationStrength', message: 'getFixationStrength' }, (response) => {
  fixationStrengthLabelValue.textContent = response.data;
  fixationStrengthSlider.value = response.data;
});

toggleBtn.addEventListener('click', async () => {
  setBrModeOnBody(document.body.getAttribute('br-mode') === 'off');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'toggleReadingMode', data: undefined },
      () => {
        if (chrome.runtime.lastError) {
          // no-op
        }
      },
    );
  });
});

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  chrome.runtime.sendMessage(
    { message: 'setToggleOnDefault', data: event.target.checked },
    (response) => {
    },
  );
});

async function updateLineHeightClickHandler(event) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'setlineHeight', action: event.target.getAttribute('id'), step: 0.5 },
      () => {
        if (chrome.runtime.lastError) {
          // no-op
        }
      },
    );
  });
}

function updateSaccadesChangeHandler(event) {
  const saccadesInterval = Number(event.target.value);
  updateSaccadesLabelValue(saccadesInterval);
  updateSaccadesIntermediateHandler(saccadesInterval);
}

async function updateSaccadesIntermediateHandler(_saccadesInterval) {
  chrome.runtime.sendMessage(
    { message: 'setSaccadesInterval', data: _saccadesInterval },
    (response) => {
    },
  );
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => new Promise(() => {
      try {
        chrome.tabs.sendMessage(
          tab.id,
          { type: 'setSaccadesIntervalInDOM', data: _saccadesInterval },
          () => {
            if (chrome.runtime.lastError) {
              // no-op
            }
          },
        );
      } catch (e) {
        // no-op
      }
    }));
  });
}

fixationStrengthSlider.addEventListener('change', (event) => {
  fixationStrengthLabelValue.textContent = event.target.value;
  const payload = { message: 'setFixationStrength', type: 'setFixationStrength', data: event.target.value };
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, payload, (response) => {
      //
    });
  });

  chrome.runtime.sendMessage(payload, (response) => {
  });
});
/**
 * @description Show the word interval between saccades
 */
function updateSaccadesLabelValue(saccadesInterval) {
  document.getElementById('saccadesLabelValue').textContent = saccadesInterval;
}

function setBrModeOnBody(/** @type boolean */mode) {
  document.body.setAttribute('br-mode', mode ? 'on' : 'off');
}

async function handleToggledOnListChange() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    toggledListBtn.classList.remove('bg-danger');
    if (toggledOnList[currentUrl]) {
      toggledListBtn.textContent = 'Remove URL From Toggled On List';
      toggledListBtn.classList.add('bg-danger');
      toggledListBtn.setAttribute('data-url', currentUrl);
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: 'toggleReadingMode', data: undefined },
        () => {
          if (chrome.runtime.lastError) {
            // no-op
          }
        },
      );
    } else {
      toggledListBtn.textContent = 'Add URL To Toggled On List';
    }
  });

  while (toggledOnListEl.firstChild) {
    toggledOnListEl.removeChild(toggledOnListEl.firstChild);
  }
  for (const url in toggledOnList) {
    if (toggledOnList[url]) {
      const li = document.createElement('li');
      li.textContent = url;
      toggledOnListEl.appendChild(li);
    }
  }
}

chrome.runtime.sendMessage(
  { message: 'getToggledOnList' },
  (response) => {
    toggledOnList = response.data;
    handleToggledOnListChange();
  },
);

toggledListBtn.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const urlToRemove = toggledListBtn.getAttribute('data-url');
    if (urlToRemove && toggledOnList[urlToRemove]) {
      delete toggledOnList[urlToRemove];
    } else {
      toggledOnList[tabs[0].url] = true;
    }
    chrome.runtime.sendMessage(
      { message: 'setToggledOnList', data: toggledOnList },
      (response) => {
        if (chrome.runtime.lastError) {
          // no-op
        } else if (response.success) {
          handleToggledOnListChange();
        }
      },
    );
  });
});
