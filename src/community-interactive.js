import { supabase } from './supabase.js'

const authStatus = document.getElementById('auth-status')
const authEmail = document.getElementById('auth-email')
const authPassword = document.getElementById('auth-password')
const signupBtn = document.getElementById('signup-btn')
const loginBtn = document.getElementById('login-btn')
const logoutBtn = document.getElementById('logout-btn')

const postTypeEl = document.getElementById('post-type')
const postTitleEl = document.getElementById('post-title')
const postContentEl = document.getElementById('post-content')
const postSubmitBtn = document.getElementById('post-submit-btn')

const storiesFeed = document.getElementById('stories-feed')
const discussionsFeed = document.getElementById('discussions-feed')
const communityNotice = document.getElementById('community-notice')

const LOCAL_BLOCKLIST = [
  'porn', 'xxx', 'nude', 'nsfw', 'onlyfans', 'camgirl', 'escort',
  'fetish', 'anal', 'blowjob', 'handjob', 'cumshot', 'rape', 'incest', 'loli', 'cp'
]

let currentUser = null
let posts = []
let comments = []

init()

async function init() {
  if (!supabase) {
    setNotice('Community auth is not configured. Add Supabase env vars to enable posting.', 'error')
    disableCommunityActions()
    return
  }

  const { data } = await supabase.auth.getSession()
  currentUser = data?.session?.user || null
  updateAuthUI()

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null
    updateAuthUI()
    renderFeeds()
  })

  wireAuthEvents()
  wireComposerEvent()
  wireFeedEvents()
  await loadCommunityData()
}

function wireAuthEvents() {
  signupBtn?.addEventListener('click', async () => {
    const email = authEmail.value.trim()
    const password = authPassword.value.trim()

    if (!isValidEmail(email) || password.length < 8) {
      setNotice('Use a valid email and a password with at least 8 characters.', 'error')
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setNotice(error.message, 'error')
      return
    }

    setNotice('Account created. Check your email for confirmation if required.', 'success')
  })

  loginBtn?.addEventListener('click', async () => {
    const email = authEmail.value.trim()
    const password = authPassword.value.trim()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setNotice(error.message, 'error')
      return
    }

    setNotice('Signed in. You can now post and comment.', 'success')
  })

  logoutBtn?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setNotice(error.message, 'error')
      return
    }

    setNotice('Signed out.', 'info')
  })
}

function wireComposerEvent() {
  postSubmitBtn?.addEventListener('click', async () => {
    if (!requireAuth()) return

    const post_type = postTypeEl.value
    const title = postTitleEl.value.trim()
    const content = postContentEl.value.trim()

    if (title.length < 3 || content.length < 5) {
      setNotice('Add a title and at least a short paragraph.', 'error')
      return
    }

    if (isNsfw(`${title} ${content}`)) {
      setNotice('Post blocked by safety filter. Please keep content safe and supportive.', 'error')
      return
    }

    const { error } = await supabase.from('community_posts').insert([{
      author_id: currentUser.id,
      post_type,
      title,
      content
    }])

    if (error) {
      handleDbError(error)
      return
    }

    postTitleEl.value = ''
    postContentEl.value = ''
    setNotice('Posted successfully.', 'success')
    await loadCommunityData()
  })
}

function wireFeedEvents() {
  document.addEventListener('click', async event => {
    const reportPostBtn = event.target.closest('[data-report-post]')
    if (reportPostBtn) {
      if (!requireAuth()) return
      await reportPost(reportPostBtn.dataset.reportPost)
      return
    }

    const reportCommentBtn = event.target.closest('[data-report-comment]')
    if (reportCommentBtn) {
      if (!requireAuth()) return
      await reportComment(reportCommentBtn.dataset.reportComment)
      return
    }

    const commentBtn = event.target.closest('[data-submit-comment]')
    if (commentBtn) {
      if (!requireAuth()) return
      const postId = commentBtn.dataset.submitComment
      const input = document.getElementById(`comment-input-${postId}`)
      if (!input) return

      const body = input.value.trim()
      if (body.length < 2) {
        setNotice('Comment is too short.', 'error')
        return
      }

      if (isNsfw(body)) {
        setNotice('Comment blocked by safety filter. Please keep content safe and supportive.', 'error')
        return
      }

      const { error } = await supabase.from('community_comments').insert([{
        post_id: postId,
        author_id: currentUser.id,
        body
      }])

      if (error) {
        handleDbError(error)
        return
      }

      input.value = ''
      setNotice('Comment added.', 'success')
      await loadCommunityData()
    }
  })
}

async function loadCommunityData() {
  const postsQuery = supabase
    .from('community_posts')
    .select('id, post_type, title, content, author_id, created_at, status')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const commentsQuery = supabase
    .from('community_comments')
    .select('id, post_id, body, author_id, created_at, status')
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  const [postsResult, commentsResult] = await Promise.all([postsQuery, commentsQuery])

  if (postsResult.error) {
    handleDbError(postsResult.error)
    return
  }

  if (commentsResult.error) {
    handleDbError(commentsResult.error)
    return
  }

  posts = postsResult.data || []
  comments = commentsResult.data || []
  renderFeeds()
}

function renderFeeds() {
  if (!storiesFeed || !discussionsFeed) return

  const storyPosts = posts.filter(p => p.post_type === 'story')
  const discussionPosts = posts.filter(p => p.post_type === 'discussion')

  storiesFeed.innerHTML = renderPostList(storyPosts, 'No stories yet. Be the first to share.')
  discussionsFeed.innerHTML = renderPostList(discussionPosts, 'No discussion posts yet. Start the conversation.')
}

function renderPostList(postList, emptyText) {
  if (!postList.length) {
    return `<div class=\"empty-state\">${escapeHtml(emptyText)}</div>`
  }

  return postList.map(post => renderPost(post)).join('')
}

function renderPost(post) {
  const postComments = comments.filter(c => c.post_id === post.id)
  const commentsHtml = postComments.length
    ? postComments.map(comment => `
      <div class=\"comment-item\">
        <div class=\"meta-row\">${formatAuthor(comment.author_id)} · ${formatDate(comment.created_at)}</div>
        <p>${escapeHtml(comment.body)}</p>
        <button class=\"link-btn\" data-report-comment=\"${escapeHtml(comment.id)}\">Report</button>
      </div>
    `).join('')
    : '<div class="empty-comments">No comments yet.</div>'

  const commentComposer = currentUser
    ? `
      <div class=\"comment-composer\">
        <textarea id=\"comment-input-${escapeHtml(post.id)}\" placeholder=\"Write a comment\"></textarea>
        <button class=\"mini-btn\" data-submit-comment=\"${escapeHtml(post.id)}\">Comment</button>
      </div>
    `
    : '<div class="empty-comments">Sign in to comment.</div>'

  return `
    <article class=\"community-post\">
      <div class=\"meta-row\">${formatAuthor(post.author_id)} · ${formatDate(post.created_at)}</div>
      <h4>${escapeHtml(post.title)}</h4>
      <p>${escapeHtml(post.content)}</p>
      <button class=\"link-btn\" data-report-post=\"${escapeHtml(post.id)}\">Report</button>
      <div class=\"comments-wrap\">
        <h5>Comments</h5>
        ${commentsHtml}
        ${commentComposer}
      </div>
    </article>
  `
}

async function reportPost(postId) {
  const reason = prompt('Report reason (required):')
  if (!reason) return

  const trimmed = reason.trim()
  if (trimmed.length < 5) {
    setNotice('Report reason must be at least 5 characters.', 'error')
    return
  }

  const { error } = await supabase.from('community_reports').insert([{
    post_id: postId,
    reporter_id: currentUser.id,
    reason: trimmed
  }])

  if (error) {
    if (error.code === '23505') {
      setNotice('You already reported this post.', 'info')
      return
    }
    handleDbError(error)
    return
  }

  setNotice('Post reported. Thank you.', 'success')
}

async function reportComment(commentId) {
  const reason = prompt('Report reason (required):')
  if (!reason) return

  const trimmed = reason.trim()
  if (trimmed.length < 5) {
    setNotice('Report reason must be at least 5 characters.', 'error')
    return
  }

  const { error } = await supabase.from('community_comment_reports').insert([{
    comment_id: commentId,
    reporter_id: currentUser.id,
    reason: trimmed
  }])

  if (error) {
    if (error.code === '23505') {
      setNotice('You already reported this comment.', 'info')
      return
    }
    handleDbError(error)
    return
  }

  setNotice('Comment reported. Thank you.', 'success')
}

function updateAuthUI() {
  const signedIn = Boolean(currentUser)
  if (authStatus) {
    authStatus.textContent = signedIn
      ? `Signed in as ${currentUser.email}`
      : 'Sign up or log in to post, comment, and report.'
  }

  if (signupBtn) signupBtn.disabled = signedIn
  if (loginBtn) loginBtn.disabled = signedIn
  if (logoutBtn) logoutBtn.disabled = !signedIn

  if (postSubmitBtn) postSubmitBtn.disabled = !signedIn
}

function disableCommunityActions() {
  if (signupBtn) signupBtn.disabled = true
  if (loginBtn) loginBtn.disabled = true
  if (logoutBtn) logoutBtn.disabled = true
  if (postSubmitBtn) postSubmitBtn.disabled = true
}

function requireAuth() {
  if (!currentUser) {
    setNotice('Please sign in first.', 'error')
    return false
  }
  return true
}

function isNsfw(text) {
  const normalized = String(text || '').toLowerCase()
  return LOCAL_BLOCKLIST.some(term => normalized.includes(term))
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function formatAuthor(authorId) {
  if (!authorId) return 'Member'
  return `Member ${authorId.slice(0, 8)}`
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function setNotice(message, type = 'info') {
  if (!communityNotice) return
  communityNotice.textContent = message
  communityNotice.className = `notice-banner ${type}`
}

function handleDbError(error) {
  if ((error.message || '').includes('NSFW_BLOCKED')) {
    setNotice('Blocked by NSFW firewall. Please keep posts safe for all audiences.', 'error')
    return
  }
  setNotice(error.message || 'Something went wrong.', 'error')
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
