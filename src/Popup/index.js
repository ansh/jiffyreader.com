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
changeColor.addEventListener('click', async () => {
  chrome.tabs.query({ active: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "toggleReadingMode", data: undefined },
      () => {
        if (chrome.runtime.lastError) {
        }
      }
    );
  });
})

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  chrome.storage.sync.set({ toggleOnDefault: event.target.checked })
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      return new Promise(() => {
        try {
          
          chrome.tabs.sendMessage(
            tab.id,
            { type: "setReadingMode", data: event.target.checked },
            () => {
              if (chrome.runtime.lastError) {
              }
            }
          );
        } catch (e) {}
      });
    });
  });
})
