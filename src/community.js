import { communityPosts } from './community-posts.js'

const postsRoot = document.getElementById('research-posts')

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderPosts(posts) {
  if (!postsRoot) return

  const html = posts.map(post => {
    const isExternal = /^https?:\/\//i.test(post.href)
    const tagsHtml = post.tags
      .map(tag => `<span class=\"chip\">${escapeHtml(tag)}</span>`)
      .join('')

    return `
      <article class=\"post\">
        <time datetime=\"${escapeHtml(post.dateIso)}\">${escapeHtml(post.dateLabel)}</time>
        <h3>${escapeHtml(post.title)}</h3>
        <div class=\"chips\">${tagsHtml}</div>
        <p>${escapeHtml(post.summary)}</p>
        <a class=\"read-link\" href=\"${escapeHtml(post.href)}\"${isExternal ? ' target=\"_blank\" rel=\"noopener noreferrer\"' : ''}>${escapeHtml(post.cta)}</a>
      </article>
    `
  }).join('')

  postsRoot.innerHTML = html
}

renderPosts(communityPosts)
