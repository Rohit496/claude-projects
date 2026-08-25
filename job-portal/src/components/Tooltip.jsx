import { cloneElement, useEffect, useId, useRef, useState } from 'react'

// Pointer hints wait a beat so sweeping the cursor down a column does not strobe a
// bubble over every row on the way past. Focus is deliberate, so it opens at once.
const HOVER_DELAY = 140

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
  const id = useId()

  useEffect(() => () => window.clearTimeout(timer.current), [])

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
        <span className={`tooltip-bubble tooltip-${placement}`} id={id} role="tooltip">
          {label}
        </span>
      ) : null}
    </span>
  )
}
