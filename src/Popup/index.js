const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');
const fixationStrengthSlider = document.getElementById('fixationStrengthSlider');
const fixationStrengthLabelValue = document.getElementById('fixationStrengthLabelValue');

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
