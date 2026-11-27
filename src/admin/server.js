// Your own server (see server/API.md). The admin page signs in with your email and
// password and gets a token; content, pictures and messages then go through the server.

export class ServerError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export function createServer({ url, token }) {
  const base = url.replace(/\/+$/, '')

  async function call(path, { method = 'GET', body, form } = {}) {
    let response
    try {
      response = await fetch(`${base}${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: form || (body ? JSON.stringify(body) : undefined),
        cache: 'no-store',
      })
    } catch {
      throw new ServerError(`Could not reach ${base}. Check the address, that the server is running, and that it allows this site (ALLOWED_ORIGINS).`, 0)
    }
    if (response.status === 204) return null
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const detail = typeof data?.detail === 'string' ? data.detail : ''
      const message =
        response.status === 401 && path === '/api/auth/login'
          ? 'That email and password do not match.'
          : response.status === 401
            ? 'You are signed out. Sign in again in Settings.'
            : response.status === 429
              ? 'Too many tries. Wait a few minutes.'
              : detail || `The server answered ${response.status}.`
      throw new ServerError(message, response.status, data)
    }
    return data
  }

  return {
    health: () => call('/api/health'),
    login: (email, password) => call('/api/auth/login', { method: 'POST', body: { email, password } }),
    me: () => call('/api/auth/me'),
    changePassword: (current, next) => call('/api/auth/password', { method: 'POST', body: { current, next } }),
    content: () => call('/api/content'),
    save: (collections, baseVersion, message) => call('/api/content', { method: 'PUT', body: { collections, baseVersion, message } }),
    versions: () => call('/api/versions'),
    version: (id) => call(`/api/versions/${id}`),
    restore: (id) => call(`/api/versions/${id}/restore`, { method: 'POST' }),
    upload(blob, name, folder) {
      const form = new FormData()
      form.append('file', blob, name)
      form.append('folder', folder || 'uploads')
      return call('/api/media', { method: 'POST', form })
    },
    messages: (status = 'all') => call(`/api/messages?status=${status}`),
    markMessage: (id, read) => call(`/api/messages/${id}`, { method: 'PATCH', body: { read } }),
    deleteMessage: (id) => call(`/api/messages/${id}`, { method: 'DELETE' }),
  }
}
