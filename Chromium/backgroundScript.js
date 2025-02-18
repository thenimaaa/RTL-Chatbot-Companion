chrome.storage.sync.get("rtlEnabled", function(result) {
  if (!result || !result.rtlEnabled) {
    chrome.storage.sync.set({ "rtlEnabled": true });
    chrome.action.setIcon({ path: "icons/icon2.png" }, function() {
      if (chrome.runtime.lastError) {
      } else {
      }
    });
  } else {
    if (result.rtlEnabled) {
      chrome.action.setIcon({ path: "icons/icon2.png" }, function() {
        if (chrome.runtime.lastError) {
        }
      });
    } else {
      chrome.action.setIcon({ path: "icons/icon1.png" }, function() {
        if (chrome.runtime.lastError) {
        }
      });
    }
  }
});

chrome.action.onClicked.addListener(function(tab) {
  try {
    chrome.storage.sync.get("rtlEnabled", function(result) {
      var enabled = !result.rtlEnabled;
      chrome.storage.sync.set({ "rtlEnabled": enabled }, function() {
        if (chrome.runtime.lastError) {
        } else {
        }
      });
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRTL", enabled: enabled }, function(response) {
            if (chrome.runtime.lastError) {
            } else {
            }
          });
        } else {
        }
      });
      if (enabled) {
        chrome.action.setIcon({ path: "icons/icon2.png" }, function() {
          if (chrome.runtime.lastError) {
          } else {
          }
        });
      } else {
        chrome.action.setIcon({ path: "icons/icon1.png" }, function() {
          if (chrome.runtime.lastError) {
          } else {
          }
        });
      }
    });
  } catch (error) {
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  try {
    if (changeInfo.status === "complete") {
      chrome.storage.sync.get("rtlEnabled", function(result) {
        chrome.tabs.sendMessage(tabId, { action: "toggleRTL", enabled: result.rtlEnabled }, function(response) {
          if (chrome.runtime.lastError) {
          } else {
          }
        });
      });
    }
  } catch (error) {
  }
});
