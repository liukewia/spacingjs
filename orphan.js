// ==UserScript==
// @name         Spacing Js
// @namespace    https://spacingjs.com/
// @version      0.1
// @description  Spacing Js
// @author       You
// @namespace    stevenlei
// @grant        none
// @icon         https://lh3.googleusercontent.com/Z21RzHwgZJ25br-OdZV0ME4zjkrEPnsoGm8DGTbgk7x5cP-wpwav91fYtcmchLx_pHonfD_AFGaBj2yAKIvKqFppIA=w128-h128-e365-rj-sc0x00ffffff
// @run-at document-start
// @match        *://*/*
// ==/UserScript==

const MEASURE_TRIGGER_KEY = 'q';
// const SESSION_RANDOM = Math.random().toString(16).substring(2, 6);
const CX_PREFIX = 'spacing-js-';
const TOAST_CLASS = `${CX_PREFIX}toast`;
const TEXT_CLASS = `${CX_PREFIX}text`;
const MARKER_CLASS = `${CX_PREFIX}marker`;
const MARKER_VALUE_CLASS = `${CX_PREFIX}marker-value`;

const MAX_Z_INDEX = 2147483647;
const PLACEHOLDER_Z_INDEX = MAX_Z_INDEX - 1;
const MARKER_Z_INDEX = PLACEHOLDER_Z_INDEX - 1;

const createToastNode = (msg) => {
  const node = document.createElement('div');
  node.classList.add(TOAST_CLASS);
  node.classList.add(TEXT_CLASS);
  node.innerText = msg;
  return node;
};

const showToast = (msg) => {
  const toastNode = createToastNode(msg);

  document.body.appendChild(toastNode);
  setTimeout(() => {
    const node = document.querySelector(`.${TOAST_CLASS}`);
    node?.remove();
  }, 3000);
};

const isMobile = () => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => navigator.userAgent.match(toMatchItem));
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
  placeholder.classList.add(`${CX_PREFIX}${type}-placeholder`);
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
  placeholder.style.zIndex = PLACEHOLDER_Z_INDEX.toString();
  placeholder.style.boxSizing = 'content-box';
  document.body.appendChild(placeholder);
  const dimension = document.createElement('span');
  dimension.classList.add(TEXT_CLASS);
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
  dimension.innerText = `${arrow} ${Math.round(width)} × ${Math.round(height)}`;
  placeholder.appendChild(dimension);
};

const clearPlaceholderElement = (type) => {
  const placeholder = document.querySelector(`.${CX_PREFIX}${type}-placeholder`);
  placeholder?.remove();
};

// File: marker.js

const createLine = (width, height, top, left, text, border = 'none') => {
  const marker = document.createElement('span');
  marker.style.backgroundColor = 'red';
  marker.style.position = 'fixed';
  marker.classList.add(MARKER_CLASS);
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
  marker.style.zIndex = MARKER_Z_INDEX.toString();
  marker.style.boxSizing = 'content-box';
  const value = document.createElement('span');
  value.classList.add(MARKER_VALUE_CLASS);
  value.classList.add(TEXT_CLASS);
  value.style.backgroundColor = 'red';
  value.style.color = 'white';
  value.style.fontSize = '10px';
  value.style.display = 'inline-block';
  value.style.borderRadius = '20px';
  value.style.position = 'fixed';
  value.style.width = '42px';
  value.style.lineHeight = '15px';
  value.style.height = '16px';
  value.style.textAlign = 'center';
  value.style.zIndex = MAX_Z_INDEX.toString();
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
    .querySelectorAll(`.${MARKER_CLASS}`)
    .forEach((element) => element.remove());
  document
    .querySelectorAll(`.${MARKER_VALUE_CLASS}`)
    .forEach((element) => element.remove());
};

// File: spacing.js

let active = false;
let hoveringElement = null;
let selectedElement;
let targetElement;
let delayedDismiss = false;
let delayedRef = null;

const EVENT_TYPES_TO_LISTEN = [
  'click',
  // hover
  'mouseover',
  'mouseenter',
];

const disableClickHandler = (clickEvent) => {
  clickEvent.preventDefault();
  clickEvent.stopImmediatePropagation();
  return false;
};

const disableInteractions = (keyboardEvent) => {
  if (keyboardEvent.key !== '1') {
    return;
  }
  EVENT_TYPES_TO_LISTEN.forEach((eventType) => {
    window.addEventListener(
      eventType,
      disableClickHandler,
      true,
    );
  });
  // also hover behaviors
  showToast('Click behavior disabled');
};

const restoreInteractions = (keyboardEvent) => {
  if (keyboardEvent.key !== '2') {
    return;
  }
  EVENT_TYPES_TO_LISTEN.forEach((eventType) => {
    window.removeEventListener(
      eventType,
      disableClickHandler,
      true,
    );
  });
  showToast('Click behavior restored');
};

const createToastStyle = () => {
  // toast style
  const toastStyle = document.createElement('style');
  toastStyle.innerText = `
    .${TOAST_CLASS} {
      min-width: 250px;
      margin-left: -125px;
      background-color: #333;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      padding: 16px;
      position: fixed;
      z-index: ${MAX_Z_INDEX};
      left: 50%;
      top: 30px;
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
    }
    
    .${TEXT_CLASS} {
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "apple color emoji", "segoe ui emoji", "Segoe UI Symbol", "noto color emoji";
    }`;
  return toastStyle;
};

const makeTextNodesSelectable = (keyboardEvent) => {
  if (keyboardEvent.key !== '3') {
    return;
  }
  const NODE_NAMES_NOT_TO_CHECK = [
    'script',
    'style',
    'noscript',
    '#text',
    '#comment',
    '#document',
  ];
  const nodeList = [...document.body.childNodes];
  while (nodeList.length) {
    const node = nodeList.shift();
    const parent = node.parentNode;
    const nodeName = parent.nodeName.toLowerCase();
    if (node.nodeType === node.TEXT_NODE
      && !NODE_NAMES_NOT_TO_CHECK.includes(nodeName)) {
      const span = document.createElement('span');
      span.innerText = node.wholeText;
      parent.replaceChild(span, node);
    } else {
      nodeList.unshift(...node.childNodes);
    }
  }
  showToast('Made all text nodes selectable');
};

const Spacing = {
  start() {
    const toastStyle = createToastStyle();
    document.head.appendChild(toastStyle);

    if (!document.body) {
      showToast('Unable to initialise, document.body does not exist.');
      return;
    }
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('mousemove', cursorMovedHandler);
    window.addEventListener('touchmove', cursorMovedHandler);

    // press 1 to remove all links
    window.addEventListener('keydown', disableInteractions);
    // press 2 to restore all links
    window.addEventListener('keydown', restoreInteractions);
    // press 3 to wrap each text node in a span, i.e. make all text nodes selectable
    window.addEventListener('keydown', makeTextNodesSelectable);

    showToast('Spacingjs loaded in this frame!');
  },

  stop() {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    window.removeEventListener('mousemove', cursorMovedHandler);
    window.removeEventListener('touchmove', cursorMovedHandler);

    window.removeEventListener('keydown', disableInteractions);
    window.removeEventListener('keydown', restoreInteractions);

    window.removeEventListener('keydown', makeTextNodesSelectable);
  },
};

const keyDownHandler = (e) => {
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
    disablePageScroll();
  }
  if (e.shiftKey) {
    delayedDismiss = true;
  }
};

const keyUpHandler = (e) => {
  if (e.key === MEASURE_TRIGGER_KEY && active) {
    active = false;
    delayedRef = setTimeout(cleanUp, delayedDismiss ? 3000 : 0);
  }
};

const cleanUp = () => {
  clearPlaceholderElement('selected');
  clearPlaceholderElement('target');
  delayedDismiss = false;
  selectedElement = null;
  targetElement = null;
  removeMarks();
  restorePageScroll();
};

const cursorMovedHandler = (e) => {
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
      placeMark(selected, target, 'top', top, outside);
      placeMark(selected, target, 'bottom', bottom, outside);
      placeMark(selected, target, 'left', left, outside);
      placeMark(selected, target, 'right', right, outside);
    }
  });
};

const setSelectedElement = () => {
  if (hoveringElement && hoveringElement !== selectedElement) {
    selectedElement = hoveringElement;
    clearPlaceholderElement('selected');
    const rect = selectedElement.getBoundingClientRect();
    createPlaceholderElement('selected', rect.width, rect.height, rect.top, rect.left, 'red');
  }
};

const setTargetElement = () => new Promise((resolve) => {
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

const disablePageScroll = () => {
  window.addEventListener('DOMMouseScroll', disableScrollHandler, false);
  window.addEventListener('wheel', disableScrollHandler, { passive: false });
  window.addEventListener('mousewheel', disableScrollHandler, { passive: false });
};

const restorePageScroll = () => {
  window.removeEventListener('DOMMouseScroll', disableScrollHandler);
  window.removeEventListener('wheel', disableScrollHandler);
  window.removeEventListener('mousewheel', disableScrollHandler);
};

const disableScrollHandler = (scrollEvent) => {
  scrollEvent.preventDefault();
};

// File: index.js
// load the file as fast as possible (`@run-at` in metadata),
// but `spacing.start()` triggers when load event is fired
// so that `body` is guaranteed to be loaded
window.addEventListener('load', Spacing.start);
