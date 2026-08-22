import { WORK_MODES, JOB_TYPES, LEVELS, CATEGORIES } from '../data/taxonomy.js'

// One filter body, rendered both in the sticky rail and inside the mobile drawer.
export default function Filters({ filters, onChange, counts }) {
  const toggle = (key, value) => {
    const list = filters[key]
    onChange({
      ...filters,
      [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
    })
  }

  const group = (title, key, options, countKey) => (
    <fieldset className="filter-group" key={key}>
      <legend className="sr-only">{title}</legend>
      <h3 aria-hidden="true">{title}</h3>
      {options.map((option) => (
        <label className="checkbox" key={option.id}>
          <input
            type="checkbox"
            checked={filters[key].includes(option.id)}
            onChange={() => toggle(key, option.id)}
          />
          <span>{option.label}</span>
          {counts?.[countKey]?.[option.id] != null ? (
            <span className="checkbox-count">{counts[countKey][option.id]}</span>
          ) : null}
        </label>
      ))}
    </fieldset>
  )

  return (
    <>
      <div className="filter-group">
        <h3>
          <label htmlFor="filter-fit">Minimum fit</label>
        </h3>
        <input
          id="filter-fit"
          className="range"
          type="range"
          min="0"
          max="90"
          step="10"
          value={filters.minFit}
          onChange={(event) => onChange({ ...filters, minFit: Number(event.target.value) })}
        />
        <p className="field-hint mono">
          {filters.minFit === 0 ? 'Showing every score' : `${filters.minFit}+ out of 100`}
        </p>
      </div>

      <div className="filter-group">
        <h3>
          <label htmlFor="filter-salary">Minimum salary</label>
        </h3>
        <input
          id="filter-salary"
          className="range"
          type="range"
          min="0"
          max="60"
          step="5"
          value={filters.minSalary}
          onChange={(event) => onChange({ ...filters, minSalary: Number(event.target.value) })}
        />
        <p className="field-hint mono">
          {filters.minSalary === 0 ? 'Any salary' : `₹${filters.minSalary}L and above`}
        </p>
      </div>

      {group('Work mode', 'modes', WORK_MODES, 'modes')}
      {group('Employment type', 'types', JOB_TYPES, 'types')}
      {group('Seniority', 'levels', LEVELS, 'levels')}
      {group('Function', 'categories', CATEGORIES, 'categories')}
    </>
  )
}
