/*
 Listen url changed to update remaining data
*/
chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
    if (changeInfo.url) {
        chrome.tabs.sendMessage(tabId, {
            message: 'URL changed.',
            url: changeInfo.url
        });
    }
});