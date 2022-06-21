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
// @run-at       document-start
// @match        *://*/*
// ==/UserScript==

// File: Rect.js

class Rect {
  constructor(rect) {
    this.top = rect.top;
    this.left = rect.left;
    this.width = rect.width;
    this.height = rect.height;
    this.right = rect.right;
    this.bottom = rect.bottom;
  }
  colliding(other) {
    return !(this.top > other.bottom ||
      this.right < other.left ||
      this.bottom < other.top ||
      this.left > other.right);
  }
  containing(other) {
    return (this.left <= other.left &&
      other.left < this.width &&
      this.top <= other.top &&
      other.top < this.height);
  }
  inside(other) {
    return (other.top <= this.top &&
      this.top <= other.bottom &&
      other.top <= this.bottom &&
      this.bottom <= other.bottom &&
      other.left <= this.left &&
      this.left <= other.right &&
      other.left <= this.right &&
      this.right <= other.right);
  }
}

// File: placeholder.js

function createPlaceholderElement(type, width, height, top, left, color) {
  let placeholder = document.createElement('div');
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
  let dimension = document.createElement('span');
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
  }
  else {
    dimension.style.transform = 'translateY(calc(-100% + 2px))';
    dimension.style.borderRadius = '2px 2px 0 0';
  }
  dimension.style.top = `${topOffset - 1}px`;
  dimension.style.left = `${left - 1}px`;
  dimension.innerText = `${arrow} ${Math.round(width)}px × ${Math.round(height)}px`;
  placeholder.appendChild(dimension);
}

function clearPlaceholderElement(type) {
  const placeholder = document.querySelector(`.spacing-js-${type}-placeholder`);
  if (placeholder) {
    placeholder.remove();
  }
}

// File: marker.js

function createLine(width, height, top, left, text, border = 'none') {
  let marker = document.createElement('span');
  marker.style.backgroundColor = 'red';
  marker.style.position = 'fixed';
  marker.classList.add(`spacing-js-marker`);
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
  let value = document.createElement('span');
  value.classList.add(`spacing-js-value`);
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
  }
  else if (border === 'y') {
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
}

function placeMark(rect1, rect2, direction, value, edgeToEdge = false) {
  if (direction === 'top') {
    let width = 1;
    let height = Math.abs(rect1.top - rect2.top);
    let left = Math.floor((Math.min(rect1.right, rect2.right) + Math.max(rect1.left, rect2.left)) /
      2);
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
  }
  else if (direction === 'left') {
    let width = Math.abs(rect1.left - rect2.left);
    let height = 1;
    let top = Math.floor((Math.min(rect1.bottom, rect2.bottom) + Math.max(rect1.top, rect2.top)) /
      2);
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
  }
  else if (direction === 'right') {
    let width = Math.abs(rect1.right - rect2.right);
    let height = 1;
    let top = Math.floor((Math.min(rect1.bottom, rect2.bottom) + Math.max(rect1.top, rect2.top)) /
      2);
    let left = Math.min(rect1.right, rect2.right);
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
  }
  else if (direction === 'bottom') {
    let width = 1;
    let height = Math.abs(rect1.bottom - rect2.bottom);
    let top = Math.min(rect1.bottom, rect2.bottom);
    let left = Math.floor((Math.min(rect1.right, rect2.right) + Math.max(rect1.left, rect2.left)) /
      2);
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
}

function removeMarks() {
  document
    .querySelectorAll('.spacing-js-marker')
    .forEach(function (element) {
      element.remove();
    });
  document
    .querySelectorAll('.spacing-js-value')
    .forEach(function (element) {
      element.remove();
    });
}

// File: spacing.js

let active = false;
let hoveringElement = null;
let selectedElement;
let targetElement;
let delayedDismiss = false;
let delayedRef = null;
const Spacing = {
  start() {
    if (!document.body) {
      console.warn(`Unable to initialise, document.body does not exist.`);
      return;
    }
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('mousemove', cursorMovedHandler);
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
  if (e.key === 'Alt' && !active) {
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
  if (e.key === 'Alt' && active) {
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
    hoveringElement = e.composedPath()[0];
  }
  else {
    // Fallback if not support composedPath
    hoveringElement = e.target;
  }
  if (!active) {
    return;
  }

  setTargetElement().then(() => {
    if (selectedElement != null && targetElement != null) {
      // Do the calculation
      let selectedElementRect = selectedElement.getBoundingClientRect();
      let targetElementRect = targetElement.getBoundingClientRect();
      let selected = new Rect(selectedElementRect);
      let target = new Rect(targetElementRect);
      removeMarks();
      let top, bottom, left, right, outside;
      if (selected.containing(target) ||
        selected.inside(target) ||
        selected.colliding(target)) {
        console.log(`containing || inside || colliding`);
        top = Math.round(Math.abs(selectedElementRect.top - targetElementRect.top));
        bottom = Math.round(Math.abs(selectedElementRect.bottom - targetElementRect.bottom));
        left = Math.round(Math.abs(selectedElementRect.left - targetElementRect.left));
        right = Math.round(Math.abs(selectedElementRect.right - targetElementRect.right));
        outside = false;
      }
      else {
        console.log(`outside`);
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
    let rect = selectedElement.getBoundingClientRect();
    createPlaceholderElement('selected', rect.width, rect.height, rect.top, rect.left, `red`);
  }
}

function setTargetElement() {
  return new Promise((resolve, reject) => {
    if (active &&
      hoveringElement &&
      hoveringElement !== selectedElement &&
      hoveringElement !== targetElement) {
      targetElement = hoveringElement;
      clearPlaceholderElement('target');
      let rect = targetElement.getBoundingClientRect();
      createPlaceholderElement('target', rect.width, rect.height, rect.top, rect.left, 'blue');
      resolve();
    }
  });
}

function preventPageScroll(active) {
  if (active) {
    window.addEventListener('DOMMouseScroll', scrollingPreventDefault, false);
    window.addEventListener('wheel', scrollingPreventDefault, {
      passive: false,
    });
    window.addEventListener('mousewheel', scrollingPreventDefault, {
      passive: false,
    });
  }
  else {
    window.removeEventListener('DOMMouseScroll', scrollingPreventDefault);
    window.removeEventListener('wheel', scrollingPreventDefault);
    window.removeEventListener('mousewheel', scrollingPreventDefault);
  }
}

function scrollingPreventDefault(e) {
  e.preventDefault();
}

// File: index.js

Spacing.start();