import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

// Pointer hints wait a beat so sweeping the cursor down a column does not strobe a
// bubble over every row on the way past. Focus is deliberate, so it opens at once.
const HOVER_DELAY = 140

// How close to the viewport edge a bubble may sit before it is nudged back in.
const EDGE_GUTTER = 12

/**
 * Hover/focus hint anchored to a single trigger. The bubble only exists while it is
 * open, which is what lets aria-describedby point at the same words a sighted user
 * is reading. Escape dismisses it without moving focus, and it never takes pointer
 * events, so it cannot swallow a click meant for the trigger underneath.
 *
 * The trigger is cloned rather than wrapped in something focusable: the description
 * has to hang off the anchor itself or a screen reader never announces it.
 */
export default function Tooltip({ label, placement = 'top', children }) {
  const [open, setOpen] = useState(false)
  const timer = useRef(0)
  const bubble = useRef(null)
  const id = useId()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // The bubble is centred on its trigger, so a trigger near either edge of the screen
  // would push it past the viewport and get it clipped — on a phone the footer's own
  // links sit close enough to do exactly that. Shift the bubble back inside and slide
  // the arrow the other way, so it still points at the trigger it belongs to.
  useLayoutEffect(() => {
    const node = bubble.current
    if (!node) return
    node.style.setProperty('--tip-shift', '0px')
    node.style.setProperty('--tip-arrow', '0px')
    const rect = node.getBoundingClientRect()
    const edge = 8
    const viewport = document.documentElement.clientWidth
    let shift = 0
    if (rect.left < edge) shift = edge - rect.left
    else if (rect.right > viewport - edge) shift = viewport - edge - rect.right
    if (!shift) return
    // The arrow stops short of the corner radius rather than sliding off the bubble.
    const limit = Math.max(0, rect.width / 2 - 14)
    node.style.setProperty('--tip-shift', `${shift}px`)
    node.style.setProperty('--tip-arrow', `${Math.min(limit, Math.max(-limit, shift))}px`)
  }, [open, label, placement])

  const show = (withDelay) => {
    window.clearTimeout(timer.current)
    // Reduced motion drops the stagger too — the hint should just be there.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!withDelay || reduced) {
      setOpen(true)
      return
    }
    timer.current = window.setTimeout(() => setOpen(true), HOVER_DELAY)
  }

  const hide = () => {
    window.clearTimeout(timer.current)
    setOpen(false)
  }

  if (!label) return children

  return (
    <span
      className="tooltip"
      onMouseEnter={() => show(true)}
      onMouseLeave={hide}
      onFocus={() => show(false)}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return
        event.stopPropagation()
        hide()
      }}
    >
      {cloneElement(children, { 'aria-describedby': open ? id : undefined })}
      {open ? (
        <span className={`tooltip-bubble tooltip-${placement}`} id={id} role="tooltip" ref={bubble}>
          {label}
        </span>
      ) : null}
    </span>
  )
}
