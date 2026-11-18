/**
 * Touch controls scoped to the scene and its joystick, including iOS Safari.
 *
 * onLook receives CSS-pixel deltas multiplied by sensitivity(), once per move.
 * onMove receives { forward, side }, each in [-1, 1], with radial dead zone.
 * canMove gates the joystick only; the caller can use onLook for overview orbit.
 * Call reset() whenever a modal opens or a room/floor/view changes.
 * Existing mouse handlers must ignore pointerType === 'touch' when installed.
 */
export function setupIOSControls({
  holder,
  joystick,
  knob,
  onLook = () => {},
  onMove = () => {},
  onStop = () => {},
  sensitivity = () => 1,
  canMove = () => true,
  onInteract = () => {},
} = {}) {
  if (!holder || !joystick || !knob) {
    throw new TypeError('setupIOSControls requires holder, joystick and knob elements.');
  }

  const doc = holder.ownerDocument || document;
  const win = doc.defaultView || window;
  const removers = [];
  const restoredStyles = [];
  const processedEvents = new WeakSet();
  const deadZone = 0.12;
  const lookThreshold = 3;
  let movePointer = null;
  let lookPointer = null;
  let destroyed = false;
  let lastTouchTime = 0;

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  }
  function style(element, property, value) {
    const previous = element.style[property];
    element.style[property] = value;
    restoredStyles.push(() => { element.style[property] = previous; });
  }
  for (const element of [holder, joystick]) {
    style(element, 'touchAction', 'none');
    style(element, 'overscrollBehavior', 'none');
    style(element, 'userSelect', 'none');
    style(element, 'webkitUserSelect', 'none');
    style(element, 'webkitTouchCallout', 'none');
  }
  const initialKnobTransform = knob.style.transform || '';
  const computedKnobTransform = win.getComputedStyle?.(knob)?.transform || '';
  const originalTransform = initialKnobTransform || computedKnobTransform;
  const baseTransform = originalTransform === 'none' ? '' : originalTransform;

  function prevent(event, stopPropagation = false) {
    if (event.cancelable !== false) event.preventDefault();
    if (stopPropagation) event.stopPropagation();
  }
  function touchPointer(event) {
    return event.pointerType === 'touch';
  }
  function capture(element, id) {
    try { element.setPointerCapture?.(id); } catch { /* Global listeners retain control. */ }
  }
  function release(element, id) {
    try {
      if (!element.hasPointerCapture || element.hasPointerCapture(id)) {
        element.releasePointerCapture?.(id);
      }
    } catch { /* Safari may release capture before dispatching pointercancel. */ }
  }
  function setKnob(x = 0, y = 0) {
    // Preserve an inline centering transform when provided by the host UI.
    knob.style.transform = `${baseTransform} translate3d(${x}px, ${y}px, 0)`.trim();
  }
  function movementAllowed() {
    return !destroyed && Boolean(canMove());
  }
  function setMovement(clientX, clientY) {
    if (!movePointer) return;
    if (!movementAllowed()) {
      stopMovement();
      return;
    }
    const { centreX, centreY, radius } = movePointer;
    const rawX = clientX - centreX;
    const rawY = clientY - centreY;
    const distance = Math.hypot(rawX, rawY);
    const clamp = distance > radius ? radius / distance : 1;
    const x = rawX * clamp;
    const y = rawY * clamp;
    setKnob(x, y);
    const magnitude = Math.min(distance / radius, 1);
    const amount = magnitude <= deadZone ? 0 : Math.pow((magnitude - deadZone) / (1 - deadZone), 1.3);
    const divisor = distance || 1;
    onMove({ forward: (-rawY / divisor * amount) || 0, side: (rawX / divisor * amount) || 0 });
  }
  function startMovement(id, clientX, clientY, pointerCapture = true) {
    if (movePointer || !movementAllowed()) return;
    const rect = joystick.getBoundingClientRect();
    const knobRect = knob.getBoundingClientRect();
    const diameter = Math.min(rect.width, rect.height) || 112;
    const knobDiameter = Math.min(knobRect.width, knobRect.height) || 36;
    // At most 38 CSS pixels of travel, keeping the thumb within the track.
    const radius = Math.max(16, Math.min(38, (diameter - knobDiameter) / 2));
    movePointer = {
      id,
      centreX: rect.left + rect.width / 2,
      centreY: rect.top + rect.height / 2,
      radius,
      pointerCapture,
    };
    joystick.classList.add('is-active');
    joystick.setAttribute('data-active', 'true');
    if (pointerCapture) capture(joystick, id);
    onInteract();
    setMovement(clientX, clientY);
  }
  function stopMovement() {
    const previous = movePointer;
    if (!previous) return;
    movePointer = null;
    joystick.classList.remove('is-active');
    joystick.removeAttribute('data-active');
    setKnob();
    if (previous.pointerCapture) release(joystick, previous.id);
    onMove({ forward: 0, side: 0 });
    onStop();
  }
  function startLook(id, clientX, clientY, pointerCapture = true) {
    if (lookPointer || destroyed) return;
    lookPointer = {
      id,
      startX: clientX,
      startY: clientY,
      previousX: clientX,
      previousY: clientY,
      started: false,
      pointerCapture,
    };
    if (pointerCapture) capture(holder, id);
    onInteract();
  }
  function updateLook(clientX, clientY) {
    const pointer = lookPointer;
    if (!pointer) return;
    const dx = clientX - pointer.previousX;
    const dy = clientY - pointer.previousY;
    pointer.previousX = clientX;
    pointer.previousY = clientY;
    if (!pointer.started) {
      if (Math.hypot(clientX - pointer.startX, clientY - pointer.startY) < lookThreshold) return;
      pointer.started = true;
      holder.classList.add('ios-looking');
    }
    const factor = Number(sensitivity());
    const gain = Number.isFinite(factor) ? Math.max(0, factor) : 1;
    if (dx || dy) onLook(dx * gain, dy * gain);
  }
  function stopLook() {
    const previous = lookPointer;
    if (!previous) return;
    lookPointer = null;
    holder.classList.remove('ios-looking');
    if (previous.pointerCapture) release(holder, previous.id);
  }
  function reset() {
    const hadMovement = Boolean(movePointer);
    stopMovement();
    stopLook();
    // Callbacks never retain stale movement even when no active pointer remains.
    if (!hadMovement) {
      onMove({ forward: 0, side: 0 });
      onStop();
    }
    setKnob();
  }

  function pointerMove(event) {
    if (destroyed || processedEvents.has(event)) return;
    const moving = movePointer?.id === event.pointerId;
    const looking = lookPointer?.id === event.pointerId;
    if (!moving && !looking) return;
    processedEvents.add(event);
    prevent(event, moving);
    if (moving) setMovement(event.clientX, event.clientY);
    if (looking) updateLook(event.clientX, event.clientY);
  }
  function pointerEnd(event) {
    if (movePointer?.id === event.pointerId) {
      prevent(event, true);
      stopMovement();
    }
    if (lookPointer?.id === event.pointerId) {
      prevent(event);
      stopLook();
    }
  }

  const pointerEventsSupported = typeof win.PointerEvent !== 'undefined';
  if (pointerEventsSupported) {
    listen(joystick, 'pointerdown', event => {
      if (!touchPointer(event)) return;
      lastTouchTime = Date.now();
      prevent(event, true);
      startMovement(event.pointerId, event.clientX, event.clientY);
    }, { passive: false });
    listen(holder, 'pointerdown', event => {
      if (!touchPointer(event)) return;
      lastTouchTime = Date.now();
      prevent(event);
      // Only the first scene finger controls look; a joystick finger is separate.
      if (event.pointerId !== movePointer?.id) startLook(event.pointerId, event.clientX, event.clientY);
    }, { passive: false });
    for (const element of [holder, joystick]) {
      listen(element, 'pointermove', pointerMove, { passive: false });
      listen(element, 'pointerup', pointerEnd, { passive: false });
      listen(element, 'pointercancel', pointerEnd, { passive: false });
      listen(element, 'lostpointercapture', pointerEnd, { passive: false });
    }
    // Safari occasionally drops capture during system gestures. These are fallbacks.
    listen(win, 'pointermove', pointerMove, { passive: false });
    listen(win, 'pointerup', pointerEnd, { passive: false });
    listen(win, 'pointercancel', pointerEnd, { passive: false });
  } else {
    // Older iOS versions without Pointer Events get equivalent identifier tracking.
    const touchId = touch => `touch:${touch.identifier}`;
    listen(joystick, 'touchstart', event => {
      lastTouchTime = Date.now();
      prevent(event, true);
      const touch = event.changedTouches?.[0];
      if (touch) startMovement(touchId(touch), touch.clientX, touch.clientY, false);
    }, { passive: false });
    listen(holder, 'touchstart', event => {
      lastTouchTime = Date.now();
      prevent(event);
      for (const touch of Array.from(event.changedTouches || [])) {
        if (touchId(touch) !== movePointer?.id) {
          startLook(touchId(touch), touch.clientX, touch.clientY, false);
          break;
        }
      }
    }, { passive: false });
    const touchMove = event => {
      if (processedEvents.has(event)) return;
      processedEvents.add(event);
      let owned = false;
      for (const touch of Array.from(event.changedTouches || [])) {
        const id = touchId(touch);
        if (id === movePointer?.id) { owned = true; setMovement(touch.clientX, touch.clientY); }
        if (id === lookPointer?.id) { owned = true; updateLook(touch.clientX, touch.clientY); }
      }
      if (owned) prevent(event);
    };
    const touchEnd = event => {
      for (const touch of Array.from(event.changedTouches || [])) {
        const id = touchId(touch);
        if (id === movePointer?.id) stopMovement();
        if (id === lookPointer?.id) stopLook();
      }
    };
    for (const element of [holder, joystick, win]) {
      listen(element, 'touchmove', touchMove, { passive: false });
      listen(element, 'touchend', touchEnd, { passive: false });
      listen(element, 'touchcancel', touchEnd, { passive: false });
    }
  }

  // Confine Safari browser-gesture prevention to these two controls.
  for (const element of [holder, joystick]) {
    listen(element, 'touchmove', event => prevent(event), { passive: false });
    listen(element, 'gesturestart', event => prevent(event), { passive: false });
    listen(element, 'gesturechange', event => prevent(event), { passive: false });
    listen(element, 'contextmenu', event => {
      if (Date.now() - lastTouchTime < 1500 || win.matchMedia?.('(pointer: coarse)').matches) prevent(event);
    }, { passive: false });
    listen(element, 'dblclick', event => {
      if (Date.now() - lastTouchTime < 1000) prevent(event);
    }, { passive: false });
  }
  listen(win, 'blur', reset);
  listen(win, 'orientationchange', reset);
  listen(win, 'pagehide', reset);
  listen(doc, 'visibilitychange', () => {
    if (doc.hidden || doc.visibilityState === 'hidden') reset();
  });

  function destroy() {
    if (destroyed) return;
    reset();
    destroyed = true;
    removers.splice(0).forEach(remove => remove());
    restoredStyles.reverse().forEach(restore => restore());
    knob.style.transform = initialKnobTransform;
  }
  return { destroy, reset };
}
