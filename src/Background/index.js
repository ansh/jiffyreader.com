const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const listener = (request, sender, sendResponse) => {
  switch (request.message) {
    case 'getToggleOnDefault': {
      const toggleOnDefault = localStorage.getItem('toggleOnDefault');
      sendResponse({ data: toggleOnDefault });
      break;
    }
    case 'setToggleOnDefault': {
      localStorage.setItem('toggleOnDefault', request.data);
      sendResponse({ success: true });
      break;
    }
    case 'getSaccadesInterval': {
      const saccadesInterval = localStorage.getItem('saccadesInterval');
      sendResponse({ data: saccadesInterval });
      break;
    }
    case 'setSaccadesInterval': {
      localStorage.setItem('saccadesInterval', request.data);
      sendResponse({ success: true });
      break;
    }
    case 'getFixationStrength': {
      sendResponse({ data: localStorage.getItem('fixationStrength') });
      break;
    }
    case 'setFixationStrength': {
      localStorage.setItem('fixationStrength', request.data);
      sendResponse({ success: true });
      break;
    }
    case 'getToggledOnList': {
      const toggledOnListJSON = localStorage.getItem('toggledOnList');
      try {
        const list = JSON.parse(toggledOnListJSON);
        sendResponse({ data: list });
      } catch (err) {
        sendResponse({ data: {} });
      }
      break;
    }
    case 'setToggledOnList': {
      try {
        const jsonStr = JSON.stringify(request.data);
        localStorage.setItem('toggledOnList', jsonStr);
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false });
      }
      break;
    }
    default:
      break;
  }
};
runTimeHandler.runtime.onMessage.addListener(listener);
