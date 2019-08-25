/*
 Listen url changed to update remaining data
*/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      message: 'URL changed.',
      url: changeInfo.url
    });
  }
});

chrome.runtime.onMessage.addListener(function(request) {
  if (request.message === 'Options clicked.') {
    // recalculate remaining time
    chrome.tabs.create({
      url: 'chrome://extensions/?options=' + chrome.runtime.id
    });
  }
});
