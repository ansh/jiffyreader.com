const runTimeHandler = typeof browser === "undefined"?chrome:browser;
const toggleOnDefaultCheckbox = document.getElementById('toggleReadingMode')

runTimeHandler.runtime.sendMessage(
  { message: "getToggleOnDefault" },
  function (response) {
    console.log("getToggleOnDefault response in POP up=> ", response);
    toggleOnDefaultCheckbox.checked = response["data"] == "true"?true:false;
  }
);

changeColor.addEventListener('click', async () => {
  chrome.tabs.query({ active: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "toggleReadingMode", data: undefined },
      () => {
        if (runTimeHandler.runtime.lastError) {
        }
      }
    );
  });
})

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  runTimeHandler.runtime.sendMessage(
    { message: "setToggleOnDefault", data: event.target.checked},
    function (response) {
    }
  );  
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      return new Promise(() => {
        try {
          
          chrome.tabs.sendMessage(
            tab.id,
            { type: "setReadingMode", data: event.target.checked },
            () => {
              if (runTimeHandler.runtime.lastError) {
              }
            }
          );
        } catch (e) {}
      });
    });
  });
})

