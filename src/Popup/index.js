// Initialize button with user's preferred color
let toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode')

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
