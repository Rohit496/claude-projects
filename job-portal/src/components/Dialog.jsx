import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './Icons.jsx'

const FOCUSABLE =
  'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * Modal dialog. Owns the three things a hand-rolled modal usually gets wrong:
 * focus moves in on open and returns to the trigger on close, Tab is trapped
 * inside, and Escape closes. Body scroll is locked while any dialog is open.
 * Never use window.alert/confirm — build on this instead.
 */
export default function Dialog({ open, onClose, title, description, children, footer, labelledBy, wide }) {
  const panelRef = useRef(null)
  const restoreTo = useRef(null)
  const titleId = labelledBy || 'dialog-title'

  useEffect(() => {
    if (!open) return undefined
    restoreTo.current = document.activeElement

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPad = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`

    // Everything behind the dialog goes inert, so the background is unreachable by
    // keyboard and absent from the accessibility tree. The toast region is exempt:
    // inert would silence its aria-live announcements.
    const backdrop = panelRef.current?.closest('.dialog-backdrop')
    const madeInert = []
    Array.from(body.children).forEach((child) => {
      if (child === backdrop || child.classList?.contains('toast-region')) return
      if (child.hasAttribute('inert')) return
      child.setAttribute('inert', '')
      madeInert.push(child)
    })

    // Focus the first meaningful control, not the close button, when there is one.
    const panel = panelRef.current
    const first = panel?.querySelector('[data-autofocus]') || panel?.querySelector(FOCUSABLE)
    first?.focus({ preventScroll: true })

    return () => {
      madeInert.forEach((child) => child.removeAttribute('inert'))
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPad
      const target = restoreTo.current
      if (target instanceof HTMLElement && document.contains(target)) {
        target.focus({ preventScroll: true })
      }
    }
  }, [open])

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const nodes = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) || []).filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      )
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  if (!open) return null

  return createPortal(
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`dialog${wide ? ' dialog-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <div className="dialog-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <CloseIcon />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
        {footer ? <div className="dialog-foot">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

/** Confirmation prompt. Replaces window.confirm, which this app never calls. */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'primary' }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      labelledBy="confirm-title"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            data-autofocus
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>
        This portal stores everything in your browser, so this only affects this device.
      </p>
    </Dialog>
  )
}
