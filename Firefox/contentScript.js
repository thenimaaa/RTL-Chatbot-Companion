function applyCopilotRTL() {
  const elements = document.querySelectorAll("body *:not(textarea):not(input)");
  elements.forEach(el => {
    let text = el.textContent && el.textContent.trim();
    if (!text) return;
    if (/^[\u0600-\u06FF]/.test(text)) {
      el.style.setProperty("direction", "rtl", "important");
      el.style.setProperty("text-align", "right", "important");
    } else {
      el.style.setProperty("direction", "ltr", "important");
      el.style.setProperty("text-align", "left", "important");
    }
  });
}

let fontApplied = false;
let rtlEnabled = false;
let affectedElements = new Set();

function inputDirectionListener(e) {
  updateDirection(e.target);
}

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
  if (window.location.hostname.indexOf("copilot.microsoft.com") !== -1) {
    if (rtlEnabled) {
      applyCopilotRTL();
      enableDefaultRTLCaret();
    } else {
      const elements = document.querySelectorAll("body *:not(textarea):not(input)");
      elements.forEach(el => {
        el.style.removeProperty("direction");
        el.style.removeProperty("text-align");
      });
      disableDefaultRTLCaret();
    }
    return;
  }
  
  if (rtlEnabled) {
    applyRTL();
    localizeOrderedLists();
    localizeUnorderedLists();
    enableDefaultRTLCaret();
  } else {
    removeRTL();
    removeLocalizedLists();
    disableDefaultRTLCaret();
  }
}

function containsRTL(text) {
  return /(?=.*[\u0600-\u06FF])/.test(text);
}

function forceRTLonEl(el) {
  let text = el.textContent;
  if (text && containsRTL(text)) {
    el.style.setProperty("direction", "rtl", "important");
    el.style.setProperty("text-align", "right", "important");
    affectedElements.add(el);
  }
}

function applyFont() {
  const style = document.createElement('style');
  style.setAttribute('data-extension', 'customFont');
  style.innerHTML = `
    @font-face {
      font-family: 'Estedad';
      src: url('${browser.runtime.getURL('fonts/Estedad-Regular.woff2')}') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    *:not(img):not(svg):not(canvas):not(video):not(audio) {
      font-family: Estedad, sans-serif !important;
    }
  `;
  document.head.appendChild(style);
}

function removeFont() {
  const styles = document.querySelectorAll("style[data-extension='customFont']");
  styles.forEach(s => s.remove());
}

function applyRTL() {
  const allPTags = document.querySelectorAll("p");
  allPTags.forEach(el => {
    if (el.closest("textarea")) return;
    forceRTLonEl(el);
  });
  
  const listItems = document.querySelectorAll("ol li, ul li");
  listItems.forEach(li => {
    if (containsRTL(li.textContent)) {
      forceRTLonEl(li);
      li.querySelectorAll("p").forEach(p => {
        forceRTLonEl(p);
      });
    }
  });
  
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach(heading => {
    if (containsRTL(heading.textContent)) {
      forceRTLonEl(heading);
      heading.querySelectorAll("*").forEach(child => {
        forceRTLonEl(child);
      });
    }
  });
}

function removeRTL() {
  affectedElements.forEach(el => {
    el.style.removeProperty("direction");
    el.style.removeProperty("text-align");
  });
  affectedElements.clear();
}

function localizeOrderedLists() {
  const orderedLists = document.querySelectorAll("ol");
  orderedLists.forEach(ol => {
    let rtlFound = false;
    Array.from(ol.children).forEach(li => {
      if (containsRTL(li.textContent)) {
        rtlFound = true;
      }
    });
    if (!rtlFound) return;
    
    ol.style.setProperty("list-style", "none", "important");
    
    const listItems = ol.children;
    for (let i = 0; i < listItems.length; i++) {
      let li = listItems[i];
      if (!containsRTL(li.textContent)) continue;
      let existingNumber = li.querySelector(".localized-number");
      if (existingNumber) {
        existingNumber.textContent = toPersianDigits(i + 1) + ". ";
      } else {
        let span = document.createElement("span");
        span.className = "localized-number";
        span.style.setProperty("direction", "rtl", "important");
        span.style.setProperty("text-align", "right", "important");
        span.textContent = toPersianDigits(i + 1) + ". ";
        li.insertBefore(span, li.firstChild);
      }
      li.style.setProperty("direction", "rtl", "important");
      li.style.setProperty("text-align", "right", "important");
    }
    ol.dataset.localized = "true";
  });
}

function localizeUnorderedLists() {
  const unorderedLists = document.querySelectorAll("ul");
  unorderedLists.forEach(ul => {
    let rtlFound = false;
    Array.from(ul.children).forEach(li => {
      if (containsRTL(li.textContent)) {
        rtlFound = true;
      }
    });
    if (!rtlFound) return;
    
    ul.style.setProperty("list-style", "none", "important");
    
    const listItems = ul.children;
    for (let i = 0; i < listItems.length; i++) {
      let li = listItems[i];
      if (!containsRTL(li.textContent)) continue;
      let existingBullet = li.querySelector(".localized-bullet");
      if (!existingBullet) {
        let span = document.createElement("span");
        span.className = "localized-bullet";
        span.style.setProperty("direction", "rtl", "important");
        span.style.setProperty("text-align", "right", "important");
        span.textContent = "\u25CF ";
        li.insertBefore(span, li.firstChild);
      }
      li.style.setProperty("direction", "rtl", "important");
      li.style.setProperty("text-align", "right", "important");
    }
    ul.dataset.localized = "true";
  });
}

function removeLocalizedLists() {
  const orderedLists = document.querySelectorAll("ol");
  orderedLists.forEach(ol => {
    ol.style.removeProperty("list-style");
    ol.dataset.localized = "false";
    const numbers = ol.querySelectorAll(".localized-number");
    numbers.forEach(span => span.remove());
  });
  const unorderedLists = document.querySelectorAll("ul");
  unorderedLists.forEach(ul => {
    ul.style.removeProperty("list-style");
    ul.dataset.localized = "false";
    const bullets = ul.querySelectorAll(".localized-bullet");
    bullets.forEach(span => span.remove());
  });
}

function toPersianDigits(number) {
  const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(number).split('').map(digit => {
    if (/\d/.test(digit)) {
      return persianDigits[digit];
    }
    return digit;
  }).join('');
}

setInterval(function() {
  if (rtlEnabled) {
    if (window.location.hostname.indexOf("copilot.microsoft.com") !== -1) {
      applyCopilotRTL();
    } else {
      applyRTL();
      localizeOrderedLists();
      localizeUnorderedLists();
    }
  }
}, 150);

let defaultRTLCaretObserver = null;
let defaultRTLCaretEnabled = false;

const persianRegex = /[\u0600-\u06FF]/;

function applyDefaultRTL(el) {
  el.setAttribute('dir', 'rtl');
  el.style.direction = 'rtl';
  el.style.textAlign = 'right';
}

function removeDefaultRTL(el) {
  el.removeAttribute('dir');
  el.style.removeProperty('direction');
  el.style.removeProperty('text-align');
}

function updateDirection(el) {
  if (el.value.length === 0) {
    applyDefaultRTL(el);
    return;
  }
  if (persianRegex.test(el.value)) {
    el.setAttribute('dir', 'rtl');
    el.style.direction = 'rtl';
    el.style.textAlign = 'right';
  } else {
    el.setAttribute('dir', 'ltr');
    el.style.direction = 'ltr';
    el.style.textAlign = 'left';
  }
}

function processAllInputs() {
  const inputs = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
  inputs.forEach(el => {
    applyDefaultRTL(el);
    if (!el.__attachedInputListener) {
      el.addEventListener('input', inputDirectionListener);
      el.__attachedInputListener = true;
    }
  });
}

function enableDefaultRTLCaret() {
  defaultRTLCaretEnabled = true;
  processAllInputs();
  if (!defaultRTLCaretObserver) {
    defaultRTLCaretObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches && node.matches('input[type="text"], input:not([type]), textarea')) {
                applyDefaultRTL(node);
                if (!node.__attachedInputListener) {
                  node.addEventListener('input', inputDirectionListener);
                  node.__attachedInputListener = true;
                }
              }
              const innerInputs = node.querySelectorAll ? node.querySelectorAll('input[type="text"], input:not([type]), textarea') : [];
              innerInputs.forEach(el => {
                applyDefaultRTL(el);
                if (!el.__attachedInputListener) {
                  el.addEventListener('input', inputDirectionListener);
                  el.__attachedInputListener = true;
                }
              });
            }
          });
        }
      });
    });
    defaultRTLCaretObserver.observe(document.body, { childList: true, subtree: true });
  }
}

function disableDefaultRTLCaret() {
  defaultRTLCaretEnabled = false;
  const inputs = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
  inputs.forEach(el => {
    removeDefaultRTL(el);
    if (el.__attachedInputListener) {
      el.removeEventListener('input', inputDirectionListener);
      el.__attachedInputListener = false;
    }
  });
  if (defaultRTLCaretObserver) {
    defaultRTLCaretObserver.disconnect();
    defaultRTLCaretObserver = null;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", processAllInputs);
} else {
  processAllInputs();
}

// Created By TheNima
