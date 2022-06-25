// ==UserScript==
// @name         Spacing Js
// @namespace    https://spacingjs.com/
// @version      0.1
// @description  Spacing Js
// @author       You
// @namespace    stevenlei
// @grant        none
// @not-require  https://unpkg.com/spacingjs
// @icon         https://lh3.googleusercontent.com/Z21RzHwgZJ25br-OdZV0ME4zjkrEPnsoGm8DGTbgk7x5cP-wpwav91fYtcmchLx_pHonfD_AFGaBj2yAKIvKqFppIA=w128-h128-e365-rj-sc0x00ffffff
// @run-at document-start
// @match        *://*/*
// ==/UserScript==

const MEASURE_TRIGGER_KEY = 'q';
const SESSION_RANDOM = Math.random().toString(16).substring(2, 6);
const TOAST_CLASS = `toast-${SESSION_RANDOM}`;
// const HOVER_DISABLED_CSS_ID = `hover-disabled-${SESSION_RANDOM}`;
const TOAST_SELECTOR = `.${TOAST_CLASS}`;

const createToastNode = (msg) => {
  const node = document.createElement('div');
  node.classList.add(TOAST_CLASS);
  node.innerText = msg;
  return node;
};

const showToast = (msg) => {
  const toastNode = createToastNode(msg);

  document.querySelector('body').appendChild(toastNode);
  setTimeout(() => {
    const node = document.querySelector(TOAST_SELECTOR);
    if (node) {
      document.body.removeChild(node);
    }
  }, 3000);
};

// File: Rect.js

class Rect {
  constructor(rect) {
    this.left = rect.left;
    this.right = rect.right;
    this.top = rect.top;
    this.bottom = rect.bottom;
    this.width = rect.width;
    this.height = rect.height;
  }

  colliding(that) {
    return this.top < that.bottom
      && this.right > that.left
      && this.bottom > that.top
      && this.left < that.right;
  }

  containing(that) {
    return this.top < that.top
      && this.right > that.right
      && this.bottom > that.bottom
      && this.left < that.left;
  }

  inside(that) {
    return this.top > that.top
      && this.right < that.right
      && this.bottom < that.bottom
      && this.left > that.left;
  }
}

// File: placeholder.js

const createPlaceholderElement = (type, width, height, top, left, color) => {
  const placeholder = document.createElement('div');
  placeholder.classList.add(`spacing-js-${type}-placeholder`);
  placeholder.style.border = `2px solid ${color}`;
  placeholder.style.position = 'fixed';
  placeholder.style.background = 'none';
  placeholder.style.borderRadius = '2px';
  placeholder.style.padding = '0';
  placeholder.style.margin = '0';
  placeholder.style.width = `${width - 2}px`;
  placeholder.style.height = `${height - 2}px`;
  placeholder.style.top = `${top - 1}px`;
  placeholder.style.left = `${left - 1}px`;
  placeholder.style.pointerEvents = 'none';
  placeholder.style.zIndex = '9999';
  placeholder.style.boxSizing = 'content-box';
  document.body.appendChild(placeholder);
  const dimension = document.createElement('span');
  dimension.style.background = color;
  dimension.style.position = 'fixed';
  dimension.style.display = 'inline-block';
  dimension.style.color = '#fff';
  dimension.style.padding = '2px 4px';
  dimension.style.fontSize = '10px';
  let arrow = '';
  let topOffset = top;
  if (top < 20) {
    if (top < 0) {
      topOffset = 0;
      arrow = '↑ '; // Top-Left corner is offscreen
    }
    dimension.style.borderRadius = '2px 0 2px 0';
  } else {
    dimension.style.transform = 'translateY(calc(-100% + 2px))';
    dimension.style.borderRadius = '2px 2px 0 0';
  }
  dimension.style.top = `${topOffset - 1}px`;
  dimension.style.left = `${left - 1}px`;
  dimension.innerText = `${arrow} ${Math.round(width)}px × ${Math.round(height)}px`;
  placeholder.appendChild(dimension);
};

const clearPlaceholderElement = (type) => {
  const placeholder = document.querySelector(`.spacing-js-${type}-placeholder`);
  if (placeholder) {
    placeholder.remove();
  }
};

// File: marker.js

const createLine = (width, height, top, left, text, border = 'none') => {
  const marker = document.createElement('span');
  marker.style.backgroundColor = 'red';
  marker.style.position = 'fixed';
  marker.classList.add('spacing-js-marker');
  marker.style.width = `${width}px`;
  marker.style.height = `${height}px`;
  if (border === 'x') {
    marker.style.borderLeft = '1px solid rgba(255, 255, 255, .8)';
    marker.style.borderRight = '1px solid rgba(255, 255, 255, .8)';
  }
  if (border === 'y') {
    marker.style.borderTop = '1px solid rgba(255, 255, 255, .8)';
    marker.style.borderBottom = '1px solid rgba(255, 255, 255, .8)';
  }
  marker.style.pointerEvents = 'none';
  marker.style.top = `${top}px`;
  marker.style.left = `${left}px`;
  marker.style.zIndex = '9998';
  marker.style.boxSizing = 'content-box';
  const value = document.createElement('span');
  value.classList.add('spacing-js-value');
  value.style.backgroundColor = 'red';
  value.style.color = 'white';
  value.style.fontSize = '10px';
  value.style.display = 'inline-block';
  value.style.fontFamily = 'Helvetica, sans-serif';
  value.style.fontWeight = 'bold';
  value.style.borderRadius = '20px';
  value.style.position = 'fixed';
  value.style.width = '42px';
  value.style.lineHeight = '15px';
  value.style.height = '16px';
  value.style.textAlign = 'center';
  value.style.zIndex = '10000';
  value.style.pointerEvents = 'none';
  value.innerText = text;
  value.style.boxSizing = 'content-box';
  if (border === 'x') {
    // Prevent the badge moved outside the screen
    let topOffset = top + height / 2 - 7;
    if (topOffset > document.documentElement.clientHeight - 20) {
      topOffset = document.documentElement.clientHeight - 20;
    }
    if (topOffset < 0) {
      topOffset = 6;
    }
    value.style.top = `${topOffset}px`;
    value.style.left = `${left + 6}px`;
  } else if (border === 'y') {
    // Prevent the badge moved outside the screen
    let leftOffset = left + width / 2 - 20;
    if (leftOffset > document.documentElement.clientWidth - 48) {
      leftOffset = document.documentElement.clientWidth - 48;
    }
    if (leftOffset < 0) {
      leftOffset = 6;
    }
    value.style.top = `${top + 6}px`;
    value.style.left = `${leftOffset}px`;
  }
  document.body.appendChild(marker);
  document.body.appendChild(value);
};

const placeMark = (rect1, rect2, direction, value, edgeToEdge = false) => {
  if (direction === 'top') {
    const width = 1;
    let height = Math.abs(rect1.top - rect2.top);
    const left = Math.floor((Math.min(rect1.right, rect2.right) + Math.max(rect1.left, rect2.left))
      / 2);
    let top = Math.min(rect1.top, rect2.top);
    if (edgeToEdge) {
      if (rect1.top < rect2.top) {
        return;
      }
      // If not colliding
      if (rect1.right < rect2.left || rect1.left > rect2.right) {
        return;
      }
      height = Math.abs(rect2.bottom - rect1.top);
      top = Math.min(rect2.bottom, rect1.top);
    }
    createLine(width, height, top, left, value, 'x');
  } else if (direction === 'left') {
    let width = Math.abs(rect1.left - rect2.left);
    const height = 1;
    const top = Math.floor((Math.min(rect1.bottom, rect2.bottom) + Math.max(rect1.top, rect2.top))
      / 2);
    let left = Math.min(rect1.left, rect2.left);
    if (edgeToEdge) {
      if (rect1.left < rect2.left) {
        return;
      }
      // If not overlapping
      if (rect1.bottom < rect2.top || rect1.top > rect2.bottom) {
        return;
      }
      width = Math.abs(rect1.left - rect2.right);
      left = Math.min(rect2.right, rect1.left);
    }
    createLine(width, height, top, left, value, 'y');
  } else if (direction === 'right') {
    let width = Math.abs(rect1.right - rect2.right);
    const height = 1;
    const top = Math.floor((Math.min(rect1.bottom, rect2.bottom) + Math.max(rect1.top, rect2.top))
      / 2);
    const left = Math.min(rect1.right, rect2.right);
    if (edgeToEdge) {
      if (rect1.left > rect2.right) {
        return;
      }
      // If not overlapping
      if (rect1.bottom < rect2.top || rect1.top > rect2.bottom) {
        return;
      }
      width = Math.abs(rect1.right - rect2.left);
    }
    createLine(width, height, top, left, value, 'y');
  } else if (direction === 'bottom') {
    const width = 1;
    let height = Math.abs(rect1.bottom - rect2.bottom);
    const top = Math.min(rect1.bottom, rect2.bottom);
    const left = Math.floor((Math.min(rect1.right, rect2.right) + Math.max(rect1.left, rect2.left))
      / 2);
    if (edgeToEdge) {
      if (rect2.bottom < rect1.top) {
        return;
      }
      // If not overlapping
      if (rect1.right < rect2.left || rect1.left > rect2.right) {
        return;
      }
      height = Math.abs(rect1.bottom - rect2.top);
    }
    createLine(width, height, top, left, value, 'x');
  }
};

const removeMarks = () => {
  document
    .querySelectorAll('.spacing-js-marker')
    .forEach((element) => element.remove());
  document
    .querySelectorAll('.spacing-js-value')
    .forEach((element) => element.remove());
};

// File: spacing.js

let active = false;
let hoveringElement = null;
let selectedElement;
let targetElement;
let delayedDismiss = false;
let delayedRef = null;

const eventTypesToRemove = ['click', 'mouseover', 'mouseenter'];

const removeClickHandler = (clickEvent) => {
  clickEvent.preventDefault();
  clickEvent.stopImmediatePropagation();
  return false;
};

// const addDisableHoverStyle = () => {
//   const hasAdded = !!document.getElementById(HOVER_DISABLED_CSS_ID);
//   if (hasAdded) {
//     return;
//   }

//   // hover style override
//   const hoverStyle = document.createElement('style');
//   hoverStyle.id = HOVER_DISABLED_CSS_ID;
//   hoverStyle.innerText = '*:hover {}';
//   document.querySelector('head').appendChild(hoverStyle);
// };

const removeAllLinks = (keyboardEvent) => {
  if (keyboardEvent.key !== '1') {
    return;
  }

  // addDisableHoverStyle();

  eventTypesToRemove.forEach((eventType) => {
    window.addEventListener(
      eventType,
      removeClickHandler,
      true,
    );
  });
  showToast('Click behavior disabled');
};

// const removeDisableHoverStyle = () => {
//   const style = document.getElementById(HOVER_DISABLED_CSS_ID);
//   if (!style) {
//     return;
//   }
//   style.remove();
// };

const restoreAllLinks = (keyboardEvent) => {
  if (keyboardEvent.key !== '2') {
    return;
  }
  // removeDisableHoverStyle();
  eventTypesToRemove.forEach((eventType) => {
    window.removeEventListener(
      eventType,
      removeClickHandler,
      true,
    );
  });
  showToast('Click behavior restored');
};

const addToastStyle = () => {
  // toast style
  const toastStyle = document.createElement('style');
  toastStyle.innerText = `${TOAST_SELECTOR} {
  min-width: 250px;
  margin-left: -125px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 16px;
  position: fixed;
  z-index: 99999;
  left: 50%;
  top: 30px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "apple color emoji", "segoe ui emoji", "Segoe UI Symbol", "noto color emoji";
  font-size: 17px;
  animation: ${TOAST_CLASS}-fadein 0.5s forwards, ${TOAST_CLASS}-fadeout 0.5s 2.5s forwards;
}

@keyframes ${TOAST_CLASS}-fadein {
  from {top: 0; opacity: 0;}
  to {top: 30px; opacity: 1;}
}

@keyframes ${TOAST_CLASS}-fadeout {
  from {top: 30px; opacity: 1;}
  to {top: 0; opacity: 0;}
}`;
  document.querySelector('head').appendChild(toastStyle);
};

const Spacing = {
  start() {
    addToastStyle();

    if (!document.querySelector('body')) {
      showToast('Unable to initialise, document.body does not exist.');
      return;
    }
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('mousemove', cursorMovedHandler);

    // press 1 to remove all links
    window.addEventListener('keydown', removeAllLinks);
    // press 2 to restore all links
    window.addEventListener('keydown', restoreAllLinks);

    showToast('spacingjs loaded in this frame!');
  },

  stop() {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    window.removeEventListener('mousemove', cursorMovedHandler);

    window.removeEventListener('keydown', removeAllLinks);
    window.removeEventListener('keydown', restoreAllLinks);
  },
};

function keyDownHandler(e) {
  if (delayedDismiss) {
    cleanUp();
    if (delayedRef) {
      clearTimeout(delayedRef);
      delayedRef = null;
    }
  }
  if (e.key === MEASURE_TRIGGER_KEY && !active) {
    e.preventDefault();
    active = true;
    setSelectedElement();
    preventPageScroll(true);
  }
  if (e.shiftKey) {
    delayedDismiss = true;
  }
}

function keyUpHandler(e) {
  if (e.key === MEASURE_TRIGGER_KEY && active) {
    active = false;
    delayedRef = setTimeout(() => {
      cleanUp();
    }, delayedDismiss ? 3000 : 0);
  }
}

function cleanUp() {
  clearPlaceholderElement('selected');
  clearPlaceholderElement('target');
  delayedDismiss = false;
  selectedElement = null;
  targetElement = null;
  removeMarks();
  preventPageScroll(false);
}

function cursorMovedHandler(e) {
  if (e.composedPath) {
    // Use composedPath to detect the hovering element for supporting shadow DOM
    [hoveringElement] = e.composedPath();
  } else {
    // Fallback if not support composedPath
    hoveringElement = e.target;
  }
  if (!active) {
    return;
  }

  setTargetElement().then(() => {
    if (selectedElement != null && targetElement != null) {
      // Do the calculation
      const selectedElementRect = selectedElement.getBoundingClientRect();
      const targetElementRect = targetElement.getBoundingClientRect();
      const selected = new Rect(selectedElementRect);
      const target = new Rect(targetElementRect);
      removeMarks();
      let top;
      let bottom;
      let left;
      let right;
      let outside;
      if (selected.containing(target)
        || selected.inside(target)
        || selected.colliding(target)) {
        console.log('containing || inside || colliding');
        top = Math.round(Math.abs(selectedElementRect.top - targetElementRect.top));
        bottom = Math.round(Math.abs(selectedElementRect.bottom - targetElementRect.bottom));
        left = Math.round(Math.abs(selectedElementRect.left - targetElementRect.left));
        right = Math.round(Math.abs(selectedElementRect.right - targetElementRect.right));
        outside = false;
      } else {
        console.log('outside');
        top = Math.round(Math.abs(selectedElementRect.top - targetElementRect.bottom));
        bottom = Math.round(Math.abs(selectedElementRect.bottom - targetElementRect.top));
        left = Math.round(Math.abs(selectedElementRect.left - targetElementRect.right));
        right = Math.round(Math.abs(selectedElementRect.right - targetElementRect.left));
        outside = true;
      }
      placeMark(selected, target, 'top', `${top}px`, outside);
      placeMark(selected, target, 'bottom', `${bottom}px`, outside);
      placeMark(selected, target, 'left', `${left}px`, outside);
      placeMark(selected, target, 'right', `${right}px`, outside);
    }
  });
}

function setSelectedElement() {
  if (hoveringElement && hoveringElement !== selectedElement) {
    selectedElement = hoveringElement;
    clearPlaceholderElement('selected');
    const rect = selectedElement.getBoundingClientRect();
    createPlaceholderElement('selected', rect.width, rect.height, rect.top, rect.left, 'red');
  }
}

function setTargetElement() {
  return new Promise((resolve) => {
    if (active
      && hoveringElement
      && hoveringElement !== selectedElement
      && hoveringElement !== targetElement) {
      targetElement = hoveringElement;
      clearPlaceholderElement('target');
      const rect = targetElement.getBoundingClientRect();
      createPlaceholderElement('target', rect.width, rect.height, rect.top, rect.left, 'blue');
      resolve();
    }
  });
}

function preventPageScroll(_active) {
  if (_active) {
    window.addEventListener('DOMMouseScroll', scrollingPreventDefault, false);
    window.addEventListener('wheel', scrollingPreventDefault, { passive: false });
    window.addEventListener('mousewheel', scrollingPreventDefault, { passive: false });
  } else {
    window.removeEventListener('DOMMouseScroll', scrollingPreventDefault);
    window.removeEventListener('wheel', scrollingPreventDefault);
    window.removeEventListener('mousewheel', scrollingPreventDefault);
  }
}

function scrollingPreventDefault(e) {
  e.preventDefault();
}

// File: index.js
// load the file as fast as possible (`@run-at` in metadata),
// but `spacing.start()` triggers when load event is fired
// so that `body` is more likely to be loaded
window.addEventListener('load', Spacing.start);
