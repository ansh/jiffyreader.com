
const runTimeHandler = typeof browser === "undefined"?chrome:browser;

const listener = (request, sender, sendResponse) => {
    switch (request.message) {
        case "getToggleOnDefault": {
            const toggleOnDefault = localStorage.getItem('toggleOnDefault');
            console.log("getToggleOnDefault in BG returning=>", toggleOnDefault)
            sendResponse({ data: toggleOnDefault });
            break;
        }
        case "setToggleOnDefault": {
            console.log("setToggleOnDefault in BG data=>", request.data)
            localStorage.setItem("toggleOnDefault", request.data)
            sendResponse({ success: true });
            break;
        }
        case "getSaccadesInterval": {
            const saccadesInterval = localStorage.getItem('saccadesInterval');
            console.log("getSaccadesInterval in BG returning=>", saccadesInterval)
            sendResponse({ data: saccadesInterval });
            break;
        }
        case "setSaccadesInterval": {
            console.log("setToggleOnDefault in BG data=>", request.data)
            localStorage.setItem("saccadesInterval", request.data)
            sendResponse({ success: true });
            break;
        }
    }
};
runTimeHandler.runtime.onMessage.addListener(listener);