browser.storage.local.get("rtlEnabled", function(result) {
  if (result.rtlEnabled === undefined) {
    browser.storage.local.set({ "rtlEnabled": true });
    browser.browserAction.setIcon({ path: "icons/icon2.png" });
  } else {
    if (result.rtlEnabled) {
      browser.browserAction.setIcon({ path: "icons/icon2.png" });
    } else {
      browser.browserAction.setIcon({ path: "icons/icon1.png" });
    }
  }
});

browser.storage.local.get("fontEnabled", function(result) {
  if (result.fontEnabled === undefined) {
    browser.storage.local.set({ "fontEnabled": true });
  }
});

browser.browserAction.onClicked.addListener(function(tab) {
  toggleRTL();
  toggleFont();
});

function toggleRTL() {
  browser.storage.local.get("rtlEnabled", function(result) {
    var enabled = !result.rtlEnabled;
    browser.storage.local.set({ "rtlEnabled": enabled });
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, { action: "toggleRTL", enabled: enabled });
    });
    if (enabled) {
      browser.browserAction.setIcon({ path: "icons/icon2.png" });
    } else {
      browser.browserAction.setIcon({ path: "icons/icon1.png" });
    }
  });
}

function toggleFont() {
  browser.storage.local.get("fontEnabled", function(result) {
    var enabled = !result.fontEnabled;
    browser.storage.local.set({ "fontEnabled": enabled });
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, { action: "toggleFont", enabled: enabled });
    });
  });
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    browser.storage.local.get("rtlEnabled", function(result) {
      browser.tabs.sendMessage(tabId, { action: "toggleRTL", enabled: result.rtlEnabled });
    });
    browser.storage.local.get("fontEnabled", function(result) {
      browser.tabs.sendMessage(tabId, { action: "toggleFont", enabled: result.fontEnabled });
    });
  }
});

browser.tabs.onActivated.addListener(function(activeInfo) {
  browser.storage.local.get("rtlEnabled", function(result) {
    browser.tabs.sendMessage(activeInfo.tabId, { action: "toggleRTL", enabled: result.rtlEnabled });
  });
  browser.storage.local.get("fontEnabled", function(result) {
    browser.tabs.sendMessage(activeInfo.tabId, { action: "toggleFont", enabled: result.fontEnabled });
  });
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleFont") {
  }
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleRTL") {
  }
});

// Created By TheNima
