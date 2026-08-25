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

  // A bubble is centred on its trigger, so one sitting near the right edge — the
  // footer's legal row, once the note wraps — would hang past the viewport and pull
  // out a horizontal scrollbar. Measure once it is up and slide it back inside; the
  // arrow takes the opposite shift so it still points at the trigger. Layout effect,
  // not a plain one: the correction has to land before the browser paints the bubble.
  useLayoutEffect(() => {
    const node = bubble.current
    if (!open || !node) return
    node.style.setProperty('--tooltip-shift', '0px')
    const box = node.getBoundingClientRect()
    const past = box.right - (document.documentElement.clientWidth - EDGE_GUTTER)
    const short = EDGE_GUTTER - box.left
    const shift = past > 0 ? -past : short > 0 ? short : 0
    if (shift) node.style.setProperty('--tooltip-shift', `${Math.round(shift)}px`)
  }, [open, label])

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
