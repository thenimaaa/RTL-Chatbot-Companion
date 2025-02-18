let fontApplied = false;
let rtlEnabled = false;
let lastText = "";
let cachedParagraphs = [];
let cachedTextareas = [];
let cachedLists = [];

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleFont") {
    toggleFont(request.enabled);
  } else if (request.action === "toggleRTL") {
    toggleRTL(request.enabled);
  }
});

function toggleFont(enabled) {
  if (enabled && !fontApplied) {
    applyFont();
    fontApplied = true;
  } else if (!enabled && fontApplied) {
    removeFont();
    fontApplied = false;
  }
}

function toggleRTL(enabled) {
  rtlEnabled = enabled;
  if (rtlEnabled) {
    applyRTL();
  } else {
    removeRTL();
  }
}

function applyFont() {
  const style = document.createElement('style');
  style.innerHTML = `
    @font-face {
      font-family: 'Estedad';
      src: url('${browser.runtime.getURL('fonts/Estedad-Regular.woff2')}') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    * { font-family: Estedad, sans-serif !important; };
  `;
  document.head.appendChild(style);
}

function removeFont() {
  const styles = document.getElementsByTagName('style');
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
      paragraphs[i].style.textAlign = "right";
    } else {
      paragraphs[i].style.direction = "ltr";
      paragraphs[i].style.textAlign = "left";
    }
  }

  for (let i = 0; i < textareas.length; i++) {
    textareas[i].style.direction = "ltr"; 
    textareas[i].style.textAlign = "left";
  }

  for (let i = 0; i < lists.length; i++) {
    const innerParagraphs = lists[i].getElementsByTagName("p");
    if (innerParagraphs.length > 0) {
      for (let j = 0; j < innerParagraphs.length; j++) {
        const text = innerParagraphs[j].textContent;
        const lang = detectLanguage(text);
        if (lang === "ar" || lang === "fa" || lang === "ur") {
          innerParagraphs[j].style.direction = "rtl";
          innerParagraphs[j].style.textAlign = "right";
        } else {
          innerParagraphs[j].style.direction = "ltr";
          innerParagraphs[j].style.textAlign = "left";
        }
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
    cachedParagraphs[i].style.textAlign = "initial";
  }

  for (let i = 0; i < cachedTextareas.length; i++) {
    cachedTextareas[i].style.direction = "initial";
    cachedTextareas[i].style.textAlign = "initial";
  }

  for (let i = 0; i < cachedLists.length; i++) {
    const innerParagraphs = cachedLists[i].getElementsByTagName("p");
    if (innerParagraphs.length > 0) {
      for (let j = 0; j < innerParagraphs.length; j++) {
        innerParagraphs[j].style.direction = "initial";
        innerParagraphs[j].style.textAlign = "initial";
      }
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

  if (/^[a-zA-Z]+$/.test(text)) {
    return "en"; // English
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