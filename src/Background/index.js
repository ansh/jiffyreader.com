
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
    }
};
runTimeHandler.runtime.onMessage.addListener(listener);