// Initialize buttons with user's preferred color
let documentBtns = document.getElementsByTagName("button");
let toggleBtn = document.getElementById("toggleBtn");
let toggleOnDefaultCheckbox = document.getElementById("toggleReadingMode");

chrome.storage.sync.get("color", ({ color }) => {
	//set all button colors in the popup
	for (let index = 0; index < documentBtns.length; index++) {
		let btn = documentBtns.item(index);
		btn.style.backgroundColor = color;
		if (/lineHeight/.test(btn.getAttribute("id"))) {
			btn.addEventListener("click", updateLineHeightClickHandler);
		}
	}
});

chrome.storage.sync.get("toggleOnDefault", ({ toggleOnDefault }) => {
	toggleOnDefaultCheckbox.checked = toggleOnDefault;
});

// When the button is clicked, inject convertToReadbaleText into current page
toggleBtn.addEventListener("click", async () => {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript({
		target: { tabId: tab.id, allFrames: true },
		files: ["src/convert.js"],
	});
});

toggleOnDefaultCheckbox.addEventListener("change", async (event) => {
	chrome.storage.sync.set({ toggleOnDefault: event.target.checked });
});

async function updateLineHeightClickHandler(event) {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript({
		target: { tabId: tab.id, allFrames: true },
		function: updateLineHeightActiveTab,
		args: [{ action: event.target.getAttribute("id"), LINE_HEIGHT_KEY: "--br-line-height", STEP: 0.5 }],
	});
}

function updateLineHeightActiveTab({ action, LINE_HEIGHT_KEY, STEP }) {
	// const line_height_key = "--br-line-height";
	// const STEP = 0.5; //increase or descrease line height by this much per click
	let current_height = document.body.style.getPropertyValue(LINE_HEIGHT_KEY);
  
	switch (action) {
		case "lineHeightdecrease":
			current_height = /\d+/.test(current_height) && current_height > 1 ? Number(current_height) - STEP : current_height;
			break;

		case "lineHeightIncrease":
			current_height = /\d+/.test(current_height) ? Number(current_height) : 1;
			current_height += STEP;
			break;

		case "lineHeightReset":
			current_height = "";
			break;

		default:
			break;
	}

	if (/\d+/.test(current_height)) {
		document.body.style.setProperty(LINE_HEIGHT_KEY, current_height);
	} else {
		document.body.style.removeProperty(LINE_HEIGHT_KEY);
	}
}
