// Initialize button with user's preferred color
let changeColor = document.getElementById('changeColor')
let toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode')

chrome.storage.sync.get('color', ({ color }) => {
  changeColor.style.backgroundColor = color
})

chrome.storage.sync.get('toggleOnDefault', ({ toggleOnDefault }) => {
  toggleOnDefaultCheckbox.checked = toggleOnDefault
})

// When the button is clicked, inject convertToReadbaleText into current page
changeColor.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    files: ['src/convert.js'],
  })
})

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  chrome.storage.sync.set({ toggleOnDefault: event.target.checked })
})
