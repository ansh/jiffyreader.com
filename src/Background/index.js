const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const listener = (request, sender, sendResponse) => {
  switch (request.message) {
    case 'storePrefs': {
      try {
        const prefsJSONStr = JSON.stringify(request.data);
        localStorage.setItem('preferences', prefsJSONStr);
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err });
      }
      break;
    }
    case 'retrievePrefs': {
      const prefsJSONStr = localStorage.getItem('preferences');
      try {
        const prefs = JSON.parse(prefsJSONStr);
        sendResponse({ data: prefs });
      } catch (err) {
        sendResponse({ data: null, error: err });
      }
      break;
    }
    default:
      break;
  }
};
runTimeHandler.runtime.onMessage.addListener(listener);
