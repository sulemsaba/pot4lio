// Publishing without a server: the admin page writes the content files straight into the
// GitHub repository, as one commit, with a token that only this browser knows. The push
// to main starts the deploy workflow, and the site updates about a minute later.
import { fileOf, KEYS } from '../data/index.js'

const API = 'https://api.github.com'

export class GitHubError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function explain(status, path) {
  if (status === 401) return 'GitHub did not accept the token. It may have expired: make a new one and paste it in Settings.'
  if (status === 403) return 'The token cannot do this. Give it "Contents: Read and write" on the pot4lio repository.'
  if (status === 404) return 'GitHub could not find the repository or branch. Check the names in Settings (and that the token can see that repository).'
  if (status === 409 || status === 422) return 'Someone published to GitHub at the same moment. Try again.'
  return `GitHub answered ${status} for ${path}.`
}

export function createGitHub({ owner, repo, branch, token }) {
  const base = `${API}/repos/${owner}/${repo}`

  async function call(path, { method = 'GET', body } = {}) {
    const response = await fetch(path.startsWith('http') ? path : `${base}${path}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })
    if (!response.ok) throw new GitHubError(explain(response.status, path), response.status)
    return response.status === 204 ? null : response.json()
  }

  const decode = (base64) => new TextDecoder().decode(Uint8Array.from(atob(base64.replace(/\n/g, '')), (c) => c.charCodeAt(0)))

  return {
    // Who the token belongs to, and whether it can write to the repository.
    async check() {
      const [user, repository] = await Promise.all([call(`${API}/user`), call('')])
      await call(`/branches/${encodeURIComponent(branch)}`)
      if (!repository.permissions?.push) throw new GitHubError('The token can read the repository but not write to it. Give it "Contents: Read and write".', 403)
      return { login: user.login, avatar: user.avatar_url, repo: repository.full_name }
    },

    // The content files as they are on the branch now, with the version (sha) of each.
    async load() {
      const listing = await call(`/contents/src/data?ref=${encodeURIComponent(branch)}`)
      const shas = Object.fromEntries(listing.filter((f) => f.name.endsWith('.json')).map((f) => [f.name.slice(0, -5), f.sha]))
      const collections = {}
      await Promise.all(
        KEYS.filter((key) => shas[key]).map(async (key) => {
          const file = await call(`/contents/${fileOf(key)}?ref=${encodeURIComponent(branch)}`)
          collections[key] = JSON.parse(decode(file.content))
        }),
      )
      return { collections, shas }
    },

    async shas() {
      const listing = await call(`/contents/src/data?ref=${encodeURIComponent(branch)}`)
      return Object.fromEntries(listing.filter((f) => f.name.endsWith('.json')).map((f) => [f.name.slice(0, -5), f.sha]))
    },

    // One commit with every changed file. files: [{ path, text } or { path, base64 }].
    async commit(message, files) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const ref = await call(`/git/ref/heads/${encodeURIComponent(branch)}`)
        const parent = await call(`/git/commits/${ref.object.sha}`)
        const blobs = await Promise.all(
          files.map(async (file) => {
            const blob = await call('/git/blobs', {
              method: 'POST',
              body: file.base64 != null ? { content: file.base64, encoding: 'base64' } : { content: file.text, encoding: 'utf-8' },
            })
            return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha }
          }),
        )
        const tree = await call('/git/trees', { method: 'POST', body: { base_tree: parent.tree.sha, tree: blobs } })
        const commit = await call('/git/commits', { method: 'POST', body: { message, tree: tree.sha, parents: [ref.object.sha] } })
        try {
          await call(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'PATCH', body: { sha: commit.sha, force: false } })
          return { sha: commit.sha, url: `https://github.com/${owner}/${repo}/commit/${commit.sha}`, blobs: Object.fromEntries(blobs.map((b) => [b.path, b.sha])) }
        } catch (error) {
          // Someone pushed in between: build the commit again on top of theirs, once.
          if (attempt === 0 && (error.status === 409 || error.status === 422)) continue
          throw error
        }
      }
      throw new GitHubError('Could not publish. Try again.', 0)
    },

    // The deploy that a commit started: queued, in_progress or completed (+ conclusion).
    async deployOf(sha) {
      try {
        const runs = await call(`/actions/runs?head_sha=${sha}&per_page=5`)
        const run = runs.workflow_runs?.[0]
        return run ? { status: run.status, conclusion: run.conclusion, url: run.html_url } : null
      } catch {
        return null // the token may not be allowed to read Actions; that is fine
      }
    },

    async history() {
      const commits = await call(`/commits?path=src/data&sha=${encodeURIComponent(branch)}&per_page=20`)
      return commits.map((c) => ({ sha: c.sha, message: c.commit.message.split('\n')[0], date: c.commit.author?.date, by: c.author?.login || c.commit.author?.name, url: c.html_url }))
    },

    links: {
      repo: `https://github.com/${owner}/${repo}`,
      actions: `https://github.com/${owner}/${repo}/actions`,
      newToken: 'https://github.com/settings/personal-access-tokens/new',
    },
  }
}
