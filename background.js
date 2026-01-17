chrome.action.onClicked.addListener((tab) => {
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, files: ["content.js"] })
    .then(async (res) => {
      if (!res[0].result) return;
      chrome.runtime.onMessage.addListener(
        async (message, sender, sendResponse) => {
          sendResponse(res[0].result);
        },
      );
      await chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
    })
    .catch((error) => {
      alert("whoopsie poopsie, something went wrong. sowwy :(");
    });
});
