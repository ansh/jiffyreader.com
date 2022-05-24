// Initialize buttons with user's preferred color
const documentButtons = document.getElementsByTagName('button');
const toggleBtn = document.getElementById('toggleBtn');
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode');
const SACCADES = [1,2,3,4,5]
const DEFAULT_SACCADE = 2

chrome.storage.sync.get(['saccades','color'], ({ color, saccades}) => {
  // set all button colors in the popup
  for (let index = 0; index < documentButtons.length; index++) {
    const btn = documentButtons.item(index);
    btn.style.backgroundColor = color;
    
    const btn_id = btn.getAttribute('id')
    if (/lineHeight/.test(btn_id)) {
      btn.addEventListener('click', updateLineHeightClickHandler);
    }
    else if(/saccades/i.test(btn_id)) {
      btn.addEventListener('click', updateSaccadesClickHandler)
    }    
  }

  updateSaccadesLabelValue(saccades)

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

function updateSaccadesClickHandler(event){
  

  debugger
  chrome.storage.sync.get(['saccades'],({saccades})=>{
      let next_saccades = getNextSaccades(event.target.getAttribute('id'),saccades,SACCADES)

      updateSaccadesLabelValue(next_saccades)

      updateSaccadesIntermediateHandler( next_saccades);

  })
}

async function updateSaccadesIntermediateHandler( next_saccades) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    function: ({next_saccades})=>{document.body.setAttribute('saccades',next_saccades);return next_saccades},
    args: [{next_saccades}],
  },
    ([active_frame]) => {
      chrome.storage.sync.set({ saccades:active_frame.result });
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
}



function getNextSaccades(action,previous_saccades,SACCADES){
  // if (!/\d/.test(previous_saccades)) return DEFAULT_SACCADE
  let saccades_index = SACCADES.lastIndexOf(previous_saccades)

  switch(action){
    case 'increaseSaccades': 
    saccades_index = (previous_saccades < SACCADES.length )? saccades_index+1: saccades_index
    break;  

    case 'decreaseSaccades':
      saccades_index = (previous_saccades > 1)? saccades_index -1: 0
      break;

    default:
      //use default to reset
      saccades_index = SACCADES.lastIndexOf(DEFAULT_SACCADE);
  }

  return SACCADES[saccades_index]
}

/**
 * @description Show the word interval between saccades which is displayed as (saccades -1)
 * @param {Number} saccades  
 */
function updateSaccadesLabelValue(saccades){
  document.getElementById('saccades_label_value').textContent = saccades-1
}