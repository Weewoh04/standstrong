import { supabase } from './supabase.js'

const newsletterWebhookUrl = (import.meta.env.VITE_NEWSLETTER_WEBHOOK_URL || '').trim()

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

// --- Newsletter signup ---
const newsletterBtn = document.getElementById('newsletter-btn')
const newsletterInput = document.getElementById('newsletter-input')

if (newsletterBtn && newsletterInput) {
  newsletterBtn.addEventListener('click', async () => {
    const email = newsletterInput.value.trim()

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email.', 'error')
      return
    }

    if (!newsletterWebhookUrl) {
      showToast('Email delivery is not configured yet. Please try again later.', 'error')
      return
    }

    newsletterBtn.textContent = 'Sending...'
    newsletterBtn.disabled = true

    try {
      if (supabase) {
        const { error } = await supabase.from('subscribers').insert([{ email }])
        if (error && error.code !== '23505') throw error
      }

      const response = await fetch(newsletterWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'weekly-pots-workout-plan',
          campaign: '7-day-plan'
        })
      })

      if (!response.ok) throw new Error('EMAIL_DELIVERY_FAILED')

      showToast('Your 7-day plan has been emailed!', 'success')
      newsletterInput.value = ''
    } catch (error) {
      showToast('Something went wrong. Try again.', 'error')
      console.error(error)
    } finally {
      newsletterBtn.textContent = 'Send My Free Plan →'
      newsletterBtn.disabled = false
    }
  })
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

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
