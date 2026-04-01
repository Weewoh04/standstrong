import { initAnalytics } from './analytics.js'

initAnalytics()

// --- Filter buttons ---
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
    this.classList.add('active')
    const filter = this.dataset.filter
    document.querySelectorAll('.workout-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.cat === filter) ? 'block' : 'none'
    })
  })
})

// --- Toast notification ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div')
  const colors = { success: '#4a7c59', error: '#c0392b', info: '#2980b9' }
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;background:${colors[type]};color:#fff;
    padding:0.75rem 1.4rem;border-radius:50px;font-size:0.85rem;font-family:'DM Sans',sans-serif;
    z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15);animation:fadeIn 0.3s ease;
  `
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3500)
}
