import Rect from './rect';
import { clearPlaceholderElement, createPlaceholderElement, } from './placeholder';
import { placeMark, removeMarks } from './marker';
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
    if (e.shiftKey)
        delayedDismiss = true;
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
    if (!active)
        return;
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
export default Spacing;
