import { useApp } from '../store/AppStore.jsx'
import { CloseIcon } from './Icons.jsx'

export default function Toasts() {
  const { toasts, dismissToast } = useApp()

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast${toast.tone === 'success' ? ' toast-success' : ''}`}>
          <span className="toast-text">{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
