import Logger from '../Logger';
import Preferences from '../Preferences';
import TabHelper from '../TabHelper';

const readingModeToggleBtn = document.getElementById('readingModeToggleBtn');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');
const saccadesLabelValue = document.getElementById('saccadesLabelValue');
const fixationStrengthSlider = document.getElementById('fixationStrengthSlider');
const fixationStrengthLabelValue = document.getElementById('fixationStrengthLabelValue');
const lineHeightIncrease = document.getElementById('lineHeightIncrease');
const lineHeightDecrease = document.getElementById('lineHeightDecrease');
const lineHeightLabel = document.getElementById('lineHeightLabel');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
const globalPrefsBtn = document.getElementById('globalPrefsBtn');
const localPrefsBtn = document.getElementById('localPrefsBtn');
const onPageLoadBtn = document.getElementById('onPageLoadBtn');
const onPageLoadLabel = document.getElementById('onPageLoadLabel');

/** @returns {HTMLInputElement[]} */
const getColorCheckBoxes = () => document.getElementsByName('color');

const { start, setPrefs, defaultPrefs } = Preferences.init({
  getOrigin: async () => TabHelper.getActiveTab().then(TabHelper.getTabOrigin),
  subscribe: (prefs) => {
    onSaccadesInterval(prefs.saccadesInterval);
    onFixationStrength(prefs.fixationStrength);
    onLineHeight(prefs.lineHeight);
    onScopePreference(prefs.scope);
    onPageLoadToggled(prefs.onPageLoad);
    onSaccadesColor(prefs.saccadesColor);
  },
  onStartup: async (prefs) => {
    if (prefs.onPageLoad) {
      // only toggle reading mode on startup
      // if onpage load is true
      onReadingModeToggled(true);
    } else {
      // if page load is not true
      // its possible we still have reading mode active on the current
      // if the user didnt reload the page, and just reloaded the
      // popup script
      // tab so as a last resort, make sure to check the view
      // this is necessary cause we don't store the preference
      // for reading mode
      const tab = await TabHelper.getActiveTab();

      chrome.tabs.sendMessage(tab.id, { type: 'getReadingMode' }, (res) => {
        onReadingModeToggled(res.data);
      });
    }
  },
});

async function onFixationStrength(value) {
  fixationStrengthLabelValue.textContent = value;
  fixationStrengthSlider.value = value;
  const payload = {
    message: 'setFixationStrength',
    type: 'setFixationStrength',
    data: value,
  };
  const tab = await TabHelper.getActiveTab();

  chrome.tabs.sendMessage(tab.id, payload, (response) => {
    if (chrome.runtime.lastError) {
      // no-op
    }
  });
}

async function onSaccadesInterval(value) {
  const saccadesInterval = Number(value);
  saccadesLabelValue.textContent = saccadesInterval;
  saccadesIntervalSlider.value = saccadesInterval;
  const tab = await TabHelper.getActiveTab();

  chrome.tabs.sendMessage(
    tab.id,
    { type: 'setSaccadesIntervalInDOM', data: saccadesInterval },
    () => {
      if (chrome.runtime.lastError) {
        // no-op
      }
    },
  );
}

function onPageLoadToggled(enabled) {
  if (enabled) {
    onPageLoadBtn.classList.add('selected');
  } else {
    onPageLoadBtn.classList.remove('selected');
  }
  onPageLoadLabel.textContent = enabled ? 'On' : 'Off';
}

async function onLineHeight(height) {
  if (height) {
    lineHeightLabel.textContent = `Line Height ${parseInt(height * 100, 10)}%`;
  }
  const tab = await TabHelper.getActiveTab();

  chrome.tabs.sendMessage(
    tab.id,
    { type: 'setLineHeight', data: height },
  );
}

function onScopePreference(scope) {
  [globalPrefsBtn, localPrefsBtn].forEach((el) => {
    el.classList.remove('selected');
    const scopeAttr = el.getAttribute('data-scope');
    if (scope === scopeAttr) {
      el.classList.add('selected');
    }
  });
}

async function onSaccadesColor(color = '') {
  const /** @type {HTMLInputElement} */colorInput = document.querySelector(`input[name="color"][value="${color}"]`);
  if (!colorInput) return;

  getColorCheckBoxes().forEach((colorCheckbox) => { colorCheckbox.checked = false; });
  colorInput.checked = true;

  const tab = await TabHelper.getActiveTab();
  chrome.tabs.sendMessage(tab.id, {
    type: 'setSaccadesColor',
    data: color,
  });
}

getColorCheckBoxes().forEach((colorCheckbox) => {
  colorCheckbox.addEventListener('click', (event) => {
    Logger.logInfo('radio button click', event.target);
    setPrefs({ saccadesColor: event.target.value });
  });
});

saccadesIntervalSlider.addEventListener('change', (event) => {
  setPrefs({
    saccadesInterval: event.target.value,
  });
});

fixationStrengthSlider.addEventListener('change', (event) => {
  setPrefs({
    fixationStrength: event.target.value,
  });
});

onPageLoadBtn.addEventListener('click', (event) => {
  setPrefs(({ onPageLoad }) => ({
    onPageLoad: !onPageLoad,
  }));
});

resetDefaultsBtn.addEventListener('click', () => {
  // when resetting default, we don't want to overwrite the scope
  // cause the setPrefs knows which scope we currently at.
  // and it should only reset the current selected scope
  // scope by the user
  const { scope, ...noScope } = { ...defaultPrefs() };
  setPrefs({
    ...noScope,
  });
});

[globalPrefsBtn, localPrefsBtn].forEach((el) => {
  el.addEventListener('click', (event) => {
    const scope = el.getAttribute('data-scope');
    setPrefs(({ scope: oldScope, ...oldPrefs }) => {
      if (scope === 'local' && oldScope === 'global') {
        return {
          ...oldPrefs,
          scope,
        };
      }

      return {
        scope,
      };
    });
  });
});

[lineHeightIncrease, lineHeightDecrease].forEach((el) => {
  el.addEventListener('click', (event) => {
    const operation = el.getAttribute('data-op');
    setPrefs((currentPrefs) => {
      let lineHeight = parseFloat(currentPrefs.lineHeight, 10);
      if (operation === 'increase') {
        lineHeight += 0.5;
      } else {
        lineHeight -= 0.5;
      }
      return ({
        lineHeight: Math.max(1, lineHeight),
      });
    });
  });
});

async function onReadingModeToggled(enabled) {
  if (enabled) {
    readingModeToggleBtn.classList.add('selected');
    readingModeToggleBtn.textContent = 'Reading Mode';
  } else {
    readingModeToggleBtn.classList.remove('selected');
    readingModeToggleBtn.textContent = 'Enable Reading Mode';
  }

  const tab = await TabHelper.getActiveTab();

  chrome.tabs.sendMessage(
    tab.id,
    { type: 'setReadingMode', data: enabled },
    () => {
      if (chrome.runtime.lastError) {
        // no-op
      }
    },
  );
}

readingModeToggleBtn.addEventListener('click', (event) => {
  const isOn = readingModeToggleBtn.classList.contains('selected');
  onReadingModeToggled(!isOn);
});

start();
