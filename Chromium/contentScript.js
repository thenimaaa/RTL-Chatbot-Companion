let rtlEnabled = false;
let lastText = "";
let cachedParagraphs = [];
let cachedTextareas = [];
let cachedLists = [];
let customFontFamily = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleRTL") {
    rtlEnabled = request.enabled;
    if (rtlEnabled) {
      applyRTL();
      addFontFamily();
    } else {
      removeRTL();
      removeFontFamily();
    }
    sendResponse({ message: "RTL toggled", enabled: rtlEnabled });
  }
  return true;
});

function applyRTL() {
  const paragraphs = document.getElementsByTagName("p");
  const textareas = document.getElementsByTagName("textarea");
  const lists = document.getElementsByTagName("ol");
  const lang = document.documentElement.lang;

  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].textContent;
    if (isRTLText(text) || isRTLLanguage(lang)) {
      paragraphs[i].style.direction = "rtl";
    }
  }

  for (let i = 0; i < textareas.length; i++) {
    textareas[i].style.direction = "ltr"; 
  }

  for (let i = 0; i < lists.length; i++) {
    const innerParagraphs = lists[i].getElementsByTagName("p");
    if (innerParagraphs.length > 0) {
      const text = innerParagraphs[0].textContent;
      if (isRTLText(text) || isRTLLanguage(lang)) {
        lists[i].style.direction = "rtl";
      }
    }
  }

  cachedParagraphs = paragraphs;
  cachedTextareas = textareas;
  cachedLists = lists;
}

function removeRTL() {
  for (let i = 0; i < cachedParagraphs.length; i++) {
    if (cachedParagraphs[i].style.direction === "rtl") {
      cachedParagraphs[i].style.direction = "initial";
    }
  }

  for (let i = 0; i < cachedTextareas.length; i++) {
    cachedTextareas[i].style.direction = "initial";
  }

  for (let i = 0; i < cachedLists.length; i++) {
    if (cachedLists[i].style.direction === "rtl") {
      cachedLists[i].style.direction = "initial";
    }
  }
}

function isRTLText(text) {
  const rtlLanguages = ["fa", "ar", "ur", "ps", "sd", "yi"];
  const language = detectLanguage(text);
  return rtlLanguages.includes(language);
}

function isRTLLanguage(lang) {
  const rtlLanguages = ["fa", "ar", "ur", "ps", "sd", "yi"];
  return rtlLanguages.includes(lang);
}

function detectLanguage(text) {
  if (/[ا-ی]/.test(text)) return "fa"; 
  if (/[ا-ي]/.test(text)) return "ar"; 
  if (/[آ-ی]/.test(text)) return "ur"; 
  if (/[ښ-ۍ]/.test(text)) return "ps"; 
  if (/[س-ۆ]/.test(text)) return "sd"; 
  if (/[א-ת]/.test(text)) return "yi"; 
  return null;
}

function addFontFamily() {
  if (customFontFamily === null) {
    customFontFamily = document.createElement("style");
    customFontFamily.id = "custom-font-family";
    customFontFamily.append(`
      @font-face {
        font-family: 'Estedad';
        src: url('${chrome.runtime.getURL('fonts/Estedad-Regular.woff2')}') format('woff2');
        font-weight: normal;
        font-style: normal;
      }
      * { font-family: Estedad, sans-serif !important; };
    `);
    document.body.appendChild(customFontFamily);
  }
}

function removeFontFamily() {
  if (customFontFamily !== null) {
    customFontFamily.remove();
    customFontFamily = null;
  }
}

const observer = new MutationObserver(function(mutations) {
  if (rtlEnabled) {
    applyRTL();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    applyRTL();
  } else {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    applyRTL();
  }
});
