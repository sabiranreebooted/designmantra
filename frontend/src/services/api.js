const apiBaseUrl = import.meta.env.VITE_API_URL || ''

async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.success) {
    const error = new Error(payload?.message || `Request failed (${response.status}).`)
    error.status = response.status
    throw error
  }

  return payload.data
}

export const getPublicContent = () => request('/api/content')
export const getAdminContent = (token) => request('/api/admin/content', { token })

export function loginAdmin(email, password) {
  return request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function savePage(token, pageId, page) {
  return request(`/api/admin/pages/${pageId}`, {
    method: 'PUT',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  })
}

export function saveProject(token, project, projectId) {
  return request(projectId ? `/api/admin/projects/${projectId}` : '/api/admin/projects', {
    method: projectId ? 'PUT' : 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })
}

export function deleteProject(token, projectId) {
  return request(`/api/admin/projects/${projectId}`, { method: 'DELETE', token })
}

export function uploadImages(token, files) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  return request('/api/admin/uploads', { method: 'POST', token, body: formData })
}

export function assetUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) return url
  return `${apiBaseUrl}${url}`
}
