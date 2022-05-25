// Initialize buttons with user's preferred color
const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');

chrome.storage.sync.get(['saccadesInterval'], ({ saccadesInterval }) => {
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
});

chrome.storage.sync.get('toggleOnDefault', ({ toggleOnDefault }) => {
  toggleOnDefaultCheckbox.checked = toggleOnDefault;
});

// When the button is clicked, inject convertToReadbaleText into current page
toggleBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    files: ['src/convert.js'],
  });
});

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  chrome.storage.sync.set({ toggleOnDefault: event.target.checked });
});

async function updateLineHeightClickHandler(event) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    function: updateLineHeightActiveTab,
    args: [{ action: event.target.getAttribute('id'), LINE_HEIGHT_KEY: '--br-line-height', STEP: 0.5 }],
  });
}

function updateSaccadesChangeHandler(event) {
  const saccadesInterval = Number(event.target.value);

  updateSaccadesLabelValue(saccadesInterval);

  updateSaccadesIntermediateHandler(saccadesInterval);
}

async function updateSaccadesIntermediateHandler(_saccadesInterval) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      function: (saccadesInterval) => { document.body.setAttribute('saccades-interval', saccadesInterval); return saccadesInterval; },
      args: [_saccadesInterval],
    },
    ([activeFrame]) => {
      chrome.storage.sync.set({ saccadesInterval: activeFrame.result });
    },
  );
}

function updateLineHeightActiveTab({ action, LINE_HEIGHT_KEY, STEP }) {
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
