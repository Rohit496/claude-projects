import { fitBand } from '../lib/fit.js'

/** The dial. `compact` is the card variant; the labelled variant is used in detail views. */
export default function FitMeter({ score, size = 46, showLabel = false, sub }) {
  const band = fitBand(score)
  return (
    <div className={`fit fit--${band.id}`}>
      <div
        className="fit-dial"
        style={{ width: size, height: size, '--pct': score }}
        role="img"
        aria-label={`Fit score ${score} out of 100 — ${band.label}`}
      >
        <span className="fit-value" style={{ fontSize: Math.round(size * 0.32) }}>
          {score}
        </span>
      </div>
      {showLabel ? (
        <span className="fit-label">
          <span className="fit-band">{band.label}</span>
          <span className="fit-sub">{sub || `${score} of 100 against your profile`}</span>
        </span>
      ) : null}
    </div>
  )
}

/** Weighted breakdown, so the score can be argued with rather than just trusted. */
export function FitBreakdown({ fit }) {
  return (
    <div className="fit-parts">
      {fit.parts.map((part) => (
        <div className="fit-part" key={part.key}>
          <span className="fit-part-name">{part.label}</span>
          <span className="fit-track">
            <span className="fit-fill" style={{ transform: `scaleX(${part.ratio})` }} />
          </span>
          <span className="fit-points">
            {part.points}/{part.weight}
          </span>
          <span className="fit-detail">{part.detail}</span>
        </div>
      ))}
    </div>
  )
}
