// Initialize buttons with user's preferred color
const documentButtons = document.getElementsByTagName('button');
const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const saccadeFrequencySlider = document.getElementById('saccadeFrequency');
const saccadeFrequencyDisplay = document.getElementById('saccadeDisplay');

chrome.storage.sync.get('color', ({ color }) => {
  // set all button colors in the popup
  for (let index = 0; index < documentButtons.length; index++) {
    const btn = documentButtons.item(index);
    btn.style.backgroundColor = color;
    if (/lineHeight/.test(btn.getAttribute('id'))) {
      btn.addEventListener('click', updateLineHeightClickHandler);
    }
  }
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
};

saccadeFrequencySlider.addEventListener('change', async (event) => {
	const saccadeFrequency = parseInt(event.target.value)
	chrome.storage.sync.set({ saccadeFrequency: saccadeFrequency });
	setSaccadeDisplay(saccadeFrequency)
});

chrome.storage.sync.get('saccadeFrequency', ({ saccadeFrequency }) => {
	if (!saccadeFrequency) {
		saccadeFrequency = 1;
		chrome.storage.sync.set({ saccadeFrequency: saccadeFrequency});
	}
	saccadeFrequencySlider.value = saccadeFrequency;
	setSaccadeDisplay(saccadeFrequency)
});

function setSaccadeDisplay(frequency) {
	const displayString = {
		1: "every word",
		2: "every second word",
		3: "every third word",
		4: "every fourth word",
		5: "every fifth word",
	};
	saccadeFrequencyDisplay.innerHTML = displayString[frequency];
}
