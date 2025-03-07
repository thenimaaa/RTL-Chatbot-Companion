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

let fontApplied = false;
let rtlEnabled = false;
let lastText = "";
let cachedParagraphs = [];
let cachedTextareas = [];
let cachedLists = [];

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleFont") {
    if (request.enabled && !fontApplied) {
      applyFont();
      fontApplied = true;
    } else if (!request.enabled && fontApplied) {
      removeFont();
      fontApplied = false;
    }
  }
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleRTL") {
    rtlEnabled = request.enabled;
    if (rtlEnabled) {
      applyRTL();
    } else {
      removeRTL();
    }
  }
});

function applyFont() {
  let style = document.createElement('style');
  style.innerHTML = `
    @font-face {
      font-family: 'Estedad';
      src: url('${browser.runtime.getURL('fonts/Estedad-Regular.woff2')}') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    * { font-family: Estedad, sans-serif !important; }
  `;
  document.head.appendChild(style);
}

function removeFont() {
  let styles = document.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    if (styles[i].innerHTML.includes('Estedad')) {
      styles[i].remove();
    }
  }
}

function applyRTL() {
  const paragraphs = document.getElementsByTagName("p");
  const textareas = document.getElementsByTagName("textarea");
  const lists = document.getElementsByTagName("ol");

  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].textContent;
    const lang = detectLanguage(text);
    if (lang === "ar" || lang === "fa" || lang === "ur") {
      paragraphs[i].style.direction = "rtl";
    } else {
      paragraphs[i].style.direction = "ltr";
    }
  }

  for (let i = 0; i < textareas.length; i++) {
    textareas[i].style.direction = "ltr";
  }

  for (let i = 0; i < lists.length; i++) {
    const innerParagraphs = lists[i].getElementsByTagName("p");
    for (let j = 0; j < innerParagraphs.length; j++) {
      const text = innerParagraphs[j].textContent;
      const lang = detectLanguage(text);
      if (lang === "ar" || lang === "fa" || lang === "ur") {
        innerParagraphs[j].style.direction = "rtl";
      } else {
        innerParagraphs[j].style.direction = "ltr";
      }
    }
  }

  cachedParagraphs = paragraphs;
  cachedTextareas = textareas;
  cachedLists = lists;
}

function removeRTL() {
  for (let i = 0; i < cachedParagraphs.length; i++) {
    cachedParagraphs[i].style.direction = "initial";
  }
  for (let i = 0; i < cachedTextareas.length; i++) {
    cachedTextareas[i].style.direction = "initial";
  }
  for (let i = 0; i < cachedLists.length; i++) {
    const innerParagraphs = cachedLists[i].getElementsByTagName("p");
    for (let j = 0; j < innerParagraphs.length; j++) {
      innerParagraphs[j].style.direction = "initial";
    }
  }
}

function detectLanguage(text) {
  const langRegex = {
    ar: /[ا-ي]/,
    fa: /[ا-ی]/,
    ur: /[ا-ی]/,
  };

  for (const lang in langRegex) {
    if (langRegex[lang].test(text)) {
      return lang;
    }
  }
  return "en";
}

setInterval(function() {
  const text = document.body.textContent;
  if (text !== lastText) {
    lastText = text;
    if (rtlEnabled) {
      applyRTL();
    }
  }
}, 150);

// Created By TheNima
