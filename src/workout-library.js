const workouts = [
  { id: 'leg-pump', title: 'Leg Pump Recumbent Circuit', phase: 1, mode: 'recumbent', duration: '12 min', intensity: 'Low', blurb: 'Calf and ankle pump sequence for early venous return support.', exerciseCount: 5 },
  { id: 'breathing', title: 'Diaphragmatic Breathing & Pacing', phase: 0, mode: 'breathing', duration: '8 min', intensity: 'Recovery', blurb: 'Daily autonomic downshift routine for symptom flare control.', exerciseCount: 4 },
  { id: 'seated-core', title: 'Seated Core Stability Series', phase: 2, mode: 'seated', duration: '18 min', intensity: 'Light', blurb: 'Core and posture bridge work before standing progression.', exerciseCount: 5 },
  { id: 'lower-body', title: 'Lower Body Blood Pool Prevention', phase: 3, mode: 'standing', duration: '22 min', intensity: 'Moderate', blurb: 'Targeted lower-body resistance for venous muscle pump strength.', exerciseCount: 5 },
  { id: 'tilt-training', title: 'Tilt Training Protocol', phase: 3, mode: 'standing', duration: '15 min', intensity: 'Moderate', blurb: 'Structured orthostatic tolerance progression with wall support.', exerciseCount: 4 },
  { id: 'aquatic', title: 'Pool & Aquatic Intro Flow', phase: 1, mode: 'recumbent', duration: '25 min', intensity: 'Low-Moderate', blurb: 'Hydrostatic compression cardio for severe symptom days.', exerciseCount: 5 },
  { id: 'recumbent-reset', title: 'Recumbent Core Reset Flow', phase: 1, mode: 'recumbent', duration: '10 min', intensity: 'Low', blurb: 'Floor-based activation and breathing for safe early progression.', exerciseCount: 5 },
  { id: 'supine-bike', title: 'Supine Bike Base Builder', phase: 1, mode: 'recumbent', duration: '16 min', intensity: 'Low-Moderate', blurb: 'Recumbent interval structure to build cardio base safely.', exerciseCount: 4 },
  { id: 'seated-upper', title: 'Seated Upper Body Pump', phase: 2, mode: 'seated', duration: '14 min', intensity: 'Light', blurb: 'Seated push/pull endurance with posture-first mechanics.', exerciseCount: 5 },
  { id: 'seated-transition', title: 'Seated-to-Stand Transition Builder', phase: 2, mode: 'seated', duration: '20 min', intensity: 'Light-Moderate', blurb: 'Controlled position-change training before full standing loads.', exerciseCount: 4 },
  { id: 'wall-strength', title: 'Wall Support Strength Builder', phase: 3, mode: 'standing', duration: '18 min', intensity: 'Moderate', blurb: 'Supported standing strength for orthostatic resilience.', exerciseCount: 4 },
  { id: 'upright-intervals', title: 'Upright Endurance Intervals', phase: 4, mode: 'active', duration: '24 min', intensity: 'Moderate', blurb: 'Late-phase interval plan for upright daily endurance.', exerciseCount: 4 },
  { id: 'functional-circuit', title: 'Functional Reclaim Circuit', phase: 4, mode: 'active', duration: '26 min', intensity: 'Moderate', blurb: 'Functional strength circuit modeled on real-life tasks.', exerciseCount: 5 },
  { id: 'recumbent-mobility', title: 'Recumbent Recovery Mobility', phase: 1, mode: 'recumbent', duration: '9 min', intensity: 'Very Low', blurb: 'Flare-day mobility plus breath pacing for gentle circulation.', exerciseCount: 4 },
  { id: 'recumbent-endurance', title: 'Recumbent Endurance Builder', phase: 1, mode: 'recumbent', duration: '20 min', intensity: 'Low-Moderate', blurb: 'Longer recumbent interval block for foundational conditioning.', exerciseCount: 4 },
  { id: 'seated-lower', title: 'Seated Lower Body Pump', phase: 2, mode: 'seated', duration: '16 min', intensity: 'Light', blurb: 'Seated calf and quad pump sequence for safer progression.', exerciseCount: 4 },
  { id: 'seated-mobility', title: 'Seated Mobility and Breath Flow', phase: 2, mode: 'seated', duration: '12 min', intensity: 'Low', blurb: 'Spinal mobility and breath rhythm session for reset days.', exerciseCount: 4 },
  { id: 'standing-balance', title: 'Standing Balance Starter', phase: 3, mode: 'standing', duration: '14 min', intensity: 'Light-Moderate', blurb: 'Early upright balance and calf-pump confidence builder.', exerciseCount: 4 },
  { id: 'standing-resistance', title: 'Standing Resistance Circuit', phase: 3, mode: 'standing', duration: '21 min', intensity: 'Moderate', blurb: 'Band-based standing resistance session with pacing control.', exerciseCount: 4 },
  { id: 'breath-recovery', title: 'Breath-Led Recovery Session', phase: 0, mode: 'breathing', duration: '11 min', intensity: 'Recovery', blurb: 'Autonomic recovery routine between harder training days.', exerciseCount: 4 },
  { id: 'phase4-cardio', title: 'Phase 4 Cardio Ladder', phase: 4, mode: 'active', duration: '28 min', intensity: 'Moderate', blurb: 'Progressive cardio ladder for advanced upright tolerance.', exerciseCount: 4 },
  { id: 'phase4-functional-endurance', title: 'Phase 4 Functional Endurance', phase: 4, mode: 'active', duration: '30 min', intensity: 'Moderate', blurb: 'Practical endurance circuit for day-to-day activity readiness.', exerciseCount: 4 }
]

const PAGE_SIZE = 8
let currentPage = 1
let phaseFilter = 'all'
let modeFilter = 'all'
let query = ''

const cardsEl = document.getElementById('library-cards')
const countEl = document.getElementById('library-count')
const paginationEl = document.getElementById('library-pagination')
const searchEl = document.getElementById('library-search')
const totalWorkoutsEl = document.getElementById('total-workouts')
const totalExercisesEl = document.getElementById('total-exercises')

function phaseLabel(phase) {
  if (phase === 0) return 'Breathing'
  return `Phase ${phase}`
}

function modeLabel(mode) {
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function matchesFilters(item) {
  const phaseMatch = phaseFilter === 'all' ? true : String(item.phase) === phaseFilter
  const modeMatch = modeFilter === 'all' ? true : item.mode === modeFilter
  const text = `${item.title} ${item.blurb} ${item.mode} ${phaseLabel(item.phase)} ${item.intensity}`.toLowerCase()
  const searchMatch = !query || text.includes(query)
  return phaseMatch && modeMatch && searchMatch
}

function getFiltered() {
  return workouts.filter(matchesFilters)
}

function renderCards(items) {
  if (!items.length) {
    cardsEl.innerHTML = '<div class="empty">No workouts match this filter. Try clearing one filter or changing your search.</div>'
    return
  }

  cardsEl.innerHTML = items.map(item => `
    <article class="card">
      <div class="card-top">
        <span class="chip">${phaseLabel(item.phase)}</span>
        <span class="chip subtle">${modeLabel(item.mode)}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.blurb}</p>
      <div class="meta">
        <span>${item.duration}</span>
        <span>${item.intensity}</span>
        <span>${item.exerciseCount} exercises</span>
      </div>
      <a class="open-btn" href="workout.html?w=${item.id}">Open Workout -></a>
    </article>
  `).join('')
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  if (currentPage > totalPages) currentPage = totalPages

  const buttons = []
  buttons.push(`<button type="button" class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`)

  for (let p = 1; p <= totalPages; p += 1) {
    buttons.push(`<button type="button" class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`)
  }

  buttons.push(`<button type="button" class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`)
  paginationEl.innerHTML = buttons.join('')
}

function render() {
  const filtered = getFiltered()
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  if (currentPage > totalPages) currentPage = totalPages

  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  renderCards(pageItems)
  renderPagination(filtered.length)
  countEl.textContent = `${filtered.length} workouts found`
}

function setActiveFilter(group, value) {
  const selector = group === 'phase' ? '.phase-filter' : '.mode-filter'
  document.querySelectorAll(selector).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value)
  })
}

document.querySelectorAll('.phase-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    phaseFilter = btn.dataset.value
    currentPage = 1
    setActiveFilter('phase', phaseFilter)
    render()
  })
})

document.querySelectorAll('.mode-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    modeFilter = btn.dataset.value
    currentPage = 1
    setActiveFilter('mode', modeFilter)
    render()
  })
})

searchEl.addEventListener('input', () => {
  query = searchEl.value.trim().toLowerCase()
  currentPage = 1
  render()
})

paginationEl.addEventListener('click', event => {
  const target = event.target
  if (!(target instanceof HTMLButtonElement)) return
  const page = Number(target.dataset.page)
  if (!Number.isInteger(page) || page < 1) return
  currentPage = page
  render()
})

totalWorkoutsEl.textContent = String(workouts.length)
totalExercisesEl.textContent = `${workouts.reduce((sum, item) => sum + item.exerciseCount, 0)}+`
render()
