const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');
const fixationStrengthSlider = document.getElementById('fixationStrengthSlider');
const fixationStrengthLabelValue = document.getElementById('fixationStrengthLabelValue');

runTimeHandler.runtime.sendMessage(
  { message: 'getSaccadesInterval' },
  (response) => {
    console.log('getSaccadesInterval response in POP up=> ', response);

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

runTimeHandler.runtime.sendMessage(
  { message: 'getToggleOnDefault' },
  (response) => {
    console.log('getToggleOnDefault response in POP up => ', response);
    toggleOnDefaultCheckbox.checked = response.data === 'true';
  },
);

runTimeHandler.tabs.query({ active: true }, ([tab]) => {
  runTimeHandler.tabs.sendMessage(tab.id, { type: 'getFixationStrength' }, (response) => {
    fixationStrengthLabelValue.textContent = response.data;
    fixationStrengthSlider.value = response.data;
  });
});

toggleBtn.addEventListener('click', async () => {
  chrome.tabs.query({ active: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'toggleReadingMode', data: undefined },
      () => {
        if (runTimeHandler.runtime.lastError) {
          // no-op
        }
      },
    );
  });
});

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  runTimeHandler.runtime.sendMessage(
    { message: 'setToggleOnDefault', data: event.target.checked },
    (response) => {
    },
  );
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => new Promise(() => {
      try {
        chrome.tabs.sendMessage(
          tab.id,
          { type: 'setReadingMode', data: event.target.checked },
          () => {
            if (runTimeHandler.runtime.lastError) {
              // no-op
            }
          },
        );
      } catch (e) {
        // no-op
      }
    }));
  });
});

async function updateLineHeightClickHandler(event) {
  chrome.tabs.query({ active: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'setlineHeight', action: event.target.getAttribute('id'), step: 0.5 },
      () => {
        if (runTimeHandler.runtime.lastError) {
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
  runTimeHandler.runtime.sendMessage(
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
            if (runTimeHandler.runtime.lastError) {
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
  chrome.tabs.query({ active: true }, ([tab]) => {
    runTimeHandler.tabs.sendMessage(tab.id, { type: 'setFixationStrength', data: event.target.value });
  });
});
/**
 * @description Show the word interval between saccades
 */
function updateSaccadesLabelValue(saccadesInterval) {
  document.getElementById('saccadesLabelValue').textContent = saccadesInterval;
}
