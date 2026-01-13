chrome.action.onClicked.addListener((tab) =>
	{
		chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['content.js']})
		.then((res) =>
			{
				chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
					{
						sendResponse(res[0].result);
					});

				chrome.action.setPopup({popup: "index.html"});
				chrome.action.openPopup();
			})
		.catch((shit) =>
			{console.log("kak");}
		);
	}
);
// bug: ensure only either selected S1 or S2
