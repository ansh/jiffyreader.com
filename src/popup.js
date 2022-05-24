// Initialize buttons with user's preferred color
const documentButtons = document.getElementsByTagName('button');
const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const saccadesIntervalSlider = document.getElementById('saccades_slider');

chrome.storage.sync.get(['saccades', 'color'], ({ color, saccades }) => {
  // set all button colors in the popup
  for (let index = 0; index < documentButtons.length; index++) {
    const btn = documentButtons.item(index);
    btn.style.backgroundColor = color;

    const btnId = btn.getAttribute('id');
    if (/lineHeight/.test(btnId)) {
      btn.addEventListener('click', updateLineHeightClickHandler);
    }
  }

  updateSaccadesLabelValue(saccades);
  saccadesIntervalSlider.value = saccades;

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
  const nextSaccades = Number(event.target.value);

  updateSaccadesLabelValue(nextSaccades);

  updateSaccadesIntermediateHandler(nextSaccades);
}

async function updateSaccadesIntermediateHandler(nextSaccades) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      function: ({ next_saccades: saccades }) => { document.body.setAttribute('saccades', saccades); return saccades; },
      args: [{ next_saccades: nextSaccades }],
    },
    ([activeFrame]) => {
      chrome.storage.sync.set({ saccades: activeFrame.result });
    },
  );
}

function updateLineHeightActiveTab({ action, LINE_HEIGHT_KEY, STEP }) {
  // const line_height_key = "--br-line-height";
  // const STEP = 0.5; //increase or descrease line height by this much per click
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
 * @description Show the word interval between saccades which is displayed as (saccades -1)
 * @param {Number} saccades
 */
function updateSaccadesLabelValue(saccades) {
  document.getElementById('saccades_label_value').textContent = saccades - 1;
}
