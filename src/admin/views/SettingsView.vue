<template>
  <section class="settings">
    <header class="page-head">
      <div>
        <h1 data-title tabindex="-1">Settings</h1>
        <p>Where your changes go when you publish, and your content file.</p>
      </div>
    </header>

    <!-- Where changes go -->
    <h2 class="block-title">Where changes go</h2>
    <div class="modes" role="radiogroup" aria-label="Where changes go">
      <button v-for="m in modes" :key="m.id" type="button" role="radio" class="mode" :aria-checked="String(choice === m.id)" @click="pick(m.id)">
        <span class="mode-icon"><Icon :name="m.icon" /></span>
        <span class="mode-text">
          <strong>{{ m.label }}</strong>
          <span>{{ m.text }}</span>
        </span>
        <span v-if="state.mode === m.id" class="mode-now">{{ m.id === 'local' || state.connected ? 'In use' : 'Not connected' }}</span>
      </button>
    </div>

    <!-- GitHub -->
    <div v-if="choice === 'github'" class="card panel">
      <template v-if="state.mode === 'github' && state.connected">
        <div class="who">
          <img v-if="state.github.avatar" :src="state.github.avatar" alt="" width="40" height="40" />
          <div>
            <strong>Connected as {{ state.github.login }}</strong>
            <p class="muted">Publishing commits to <a :href="`https://github.com/${state.github.owner}/${state.github.repo}`" target="_blank" rel="noopener">{{ state.github.owner }}/{{ state.github.repo }}</a>, branch {{ state.github.branch }}. The site rebuilds after each one.</p>
          </div>
        </div>
        <div class="row-actions">
          <button type="button" class="btn" @click="reload"><Icon name="refresh" :size="16" /> Load the latest from GitHub</button>
          <button type="button" class="btn btn--danger" @click="signOut"><Icon name="logout" :size="16" /> Disconnect</button>
        </div>
      </template>
      <form v-else class="form" @submit.prevent="connectGh">
        <ol class="steps">
          <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">a new fine-grained token on GitHub</a>.</li>
          <li>Repository access: <strong>Only select repositories</strong>, then <strong>{{ gh.repo || 'pot4lio' }}</strong>.</li>
          <li>Permissions: <strong>Contents: Read and write</strong>. Add <strong>Actions: Read</strong> to see when the site has rebuilt.</li>
          <li>Pick an expiry (90 days is sensible), create it, and paste it below.</li>
        </ol>
        <div class="grid3">
          <label class="f"><span class="label">Owner</span><input v-model.trim="gh.owner" class="input" required autocomplete="off" /></label>
          <label class="f"><span class="label">Repository</span><input v-model.trim="gh.repo" class="input" required autocomplete="off" /></label>
          <label class="f"><span class="label">Branch</span><input v-model.trim="gh.branch" class="input" required autocomplete="off" /></label>
        </div>
        <label class="f">
          <span class="label">Token</span>
          <input v-model.trim="gh.token" class="input mono" type="password" required autocomplete="off" spellcheck="false" placeholder="github_pat_..." />
          <span class="help">It stays in this browser and is sent only to GitHub. Anyone who has it can change the repository, so do not share it.</span>
        </label>
        <label class="check"><input v-model="gh.remember" type="checkbox" /> Remember on this device</label>
        <p v-if="ghError" class="note note--bad" role="alert"><Icon name="alert" :size="16" />{{ ghError }}</p>
        <div class="row-actions">
          <button type="submit" class="btn btn--ink" :disabled="busy"><Icon :name="busy ? 'refresh' : 'github'" :size="16" :class="{ spin: busy }" /> {{ busy ? 'Checking' : 'Connect' }}</button>
        </div>
      </form>
    </div>

    <!-- Server -->
    <div v-if="choice === 'server'" class="card panel">
      <template v-if="state.mode === 'server' && state.connected">
        <div class="who">
          <span class="who-icon"><Icon name="server" /></span>
          <div>
            <strong>Signed in as {{ state.server.name || state.server.email }}</strong>
            <p class="muted">{{ state.server.url }}. Publishing saves to the server and the site shows it at once. Pictures upload as you add them.</p>
          </div>
        </div>
        <div class="row-actions">
          <button type="button" class="btn" @click="reload"><Icon name="refresh" :size="16" /> Load the latest</button>
          <button type="button" class="btn btn--danger" @click="signOut"><Icon name="logout" :size="16" /> Sign out</button>
        </div>
        <details class="pw">
          <summary>Change password</summary>
          <form class="form" @submit.prevent="changePw">
            <div class="grid2">
              <label class="f"><span class="label">Current password</span><input v-model="pw.current" class="input" type="password" required autocomplete="current-password" /></label>
              <label class="f"><span class="label">New password</span><input v-model="pw.next" class="input" type="password" required minlength="10" autocomplete="new-password" /><span class="help">At least 10 characters.</span></label>
            </div>
            <p v-if="pwError" class="note note--bad" role="alert"><Icon name="alert" :size="16" />{{ pwError }}</p>
            <div class="row-actions"><button type="submit" class="btn" :disabled="busy">Change password</button></div>
          </form>
        </details>
      </template>
      <form v-else class="form" @submit.prevent="connectServer">
        <p class="note"><Icon name="info" :size="16" /> <span>No server yet? Everything for it is in the <code>server/</code> folder of the project, and <code>server/README.md</code> explains how to run it and connect the site.</span></p>
        <label class="f">
          <span class="label">Server address</span>
          <input v-model.trim="sv.url" class="input" type="url" required placeholder="https://api.your-domain.com" autocomplete="url" />
        </label>
        <div class="grid2">
          <label class="f"><span class="label">Email</span><input v-model.trim="sv.email" class="input" type="email" required autocomplete="username" /></label>
          <label class="f"><span class="label">Password</span><input v-model="sv.password" class="input" type="password" required autocomplete="current-password" /></label>
        </div>
        <label class="check"><input v-model="sv.remember" type="checkbox" /> Stay signed in on this device</label>
        <p v-if="svError" class="note note--bad" role="alert"><Icon name="alert" :size="16" />{{ svError }}</p>
        <div class="row-actions">
          <button type="submit" class="btn btn--ink" :disabled="busy"><Icon :name="busy ? 'refresh' : 'server'" :size="16" :class="{ spin: busy }" /> {{ busy ? 'Signing in' : 'Sign in' }}</button>
        </div>
      </form>
    </div>

    <!-- This browser -->
    <div v-if="choice === 'local'" class="card panel">
      <p>Edits are saved in this browser only. To put them on the live site, save a copy of the content file below and run <code>npm run content -- import &lt;file&gt;</code> in the project, then deploy. Or connect GitHub above.</p>
      <div v-if="state.mode !== 'local'" class="row-actions">
        <button type="button" class="btn" @click="setMode('local')">Use this browser only</button>
      </div>
    </div>

    <!-- The content file -->
    <h2 class="block-title">Content file</h2>
    <div class="card panel">
      <p>One file with all the content and new pictures: a backup, or a way to move your draft to another computer.</p>
      <div class="row-actions">
        <button type="button" class="btn" @click="save"><Icon name="download" :size="16" /> Save a copy</button>
        <label class="btn">
          <Icon name="upload" :size="16" /> Open a copy
          <input type="file" accept="application/json,.json" class="visually-hidden" @change="open" />
        </label>
      </div>
      <p v-if="fileError" class="note note--bad" role="alert"><Icon name="alert" :size="16" />{{ fileError }}</p>
    </div>

    <!-- Look -->
    <h2 class="block-title">Look</h2>
    <div class="card panel theme">
      <span>Theme</span>
      <div class="seg" role="radiogroup" aria-label="Theme">
        <button v-for="option in ['light', 'dark']" :key="option" type="button" role="radio" :aria-checked="String(theme === option)" @click="setTheme(option)">
          <Icon :name="option === 'light' ? 'sun' : 'moon'" :size="16" /> {{ option === 'light' ? 'Light' : 'Dark' }}
        </button>
      </div>
    </div>

    <!-- Start again -->
    <h2 class="block-title">Start again</h2>
    <div class="card panel">
      <p>Throw away every unpublished change and new picture in this browser. The live site is not touched.</p>
      <div class="row-actions">
        <button v-if="!confirmReset" type="button" class="btn btn--danger" :disabled="!hasChanges" @click="confirmReset = true">Discard the draft</button>
        <template v-else>
          <button type="button" class="btn btn--danger" @click="reset">Yes, discard it</button>
          <button type="button" class="btn btn--ghost" @click="confirmReset = false">Keep it</button>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { connect, connectGitHub, exportBundle, hasChanges, importBundle, resetDraft, server, setMode, signIn, signOut, state, toast } from '../store.js'
import { download } from '../util.js'
import Icon from '../components/Icon.vue'

const modes = [
  { id: 'local', icon: 'laptop', label: 'This browser only', text: 'Edit and preview here. Save a copy to move it to the site.' },
  { id: 'github', icon: 'github', label: 'GitHub', text: 'Publish straight to the live site. No server needed.' },
  { id: 'server', icon: 'server', label: 'My server', text: 'For later: instant updates, pictures, contact messages.' },
]

const choice = ref(state.mode)
function pick(id) {
  choice.value = id
  if (id === 'local' && state.mode !== 'local') setMode('local')
}

const busy = ref(false)

const gh = reactive({ owner: state.github.owner, repo: state.github.repo, branch: state.github.branch, token: '', remember: state.remember })
const ghError = ref('')
async function connectGh() {
  ghError.value = ''
  busy.value = true
  try {
    const who = await connectGitHub({ ...gh })
    gh.token = ''
    toast(`Connected to GitHub as ${who.login}.`, { tone: 'ok' })
  } catch (error) {
    ghError.value = error.message
  } finally {
    busy.value = false
  }
}

const sv = reactive({ url: state.server.url, email: state.server.email, password: '', remember: state.remember })
const svError = ref('')
async function connectServer() {
  svError.value = ''
  busy.value = true
  try {
    await signIn({ ...sv })
    sv.password = ''
    if (state.error) svError.value = state.error
    else toast('Signed in to your server.', { tone: 'ok' })
  } catch (error) {
    svError.value = error.message
  } finally {
    busy.value = false
  }
}

const pw = reactive({ current: '', next: '' })
const pwError = ref('')
async function changePw() {
  pwError.value = ''
  busy.value = true
  try {
    await server().changePassword(pw.current, pw.next)
    pw.current = pw.next = ''
    // The server signs every device out after a new password.
    signOut()
    toast('Password changed. Sign in again with the new one.', { tone: 'ok' })
  } catch (error) {
    pwError.value = error.message
  } finally {
    busy.value = false
  }
}

async function reload() {
  await connect()
  if (state.error) toast(state.error, { tone: 'error' })
  else toast(state.conflicts.length ? 'Loaded. Some parts changed in both places: choose at the top.' : 'Loaded the latest published content.')
}

const fileError = ref('')
function save() {
  download(`portfolio-content-${new Date().toISOString().slice(0, 10)}.json`, exportBundle())
}
async function open(event) {
  fileError.value = ''
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    const n = importBundle(await file.text())
    toast(`Opened ${file.name}: ${n} parts are in the draft now. Review them under Changes.`, { tone: 'ok' })
  } catch (error) {
    fileError.value = error instanceof SyntaxError ? 'That file is not valid JSON.' : error.message
  }
}

const theme = ref(document.documentElement.getAttribute('data-theme') || 'light')
function setTheme(next) {
  theme.value = next
  document.documentElement.setAttribute('data-theme', next)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0e0e10' : '#ffffff')
  try {
    localStorage.setItem('theme', next)
  } catch {
    // Not saved; it lasts until the page closes.
  }
}

const confirmReset = ref(false)
async function reset() {
  await resetDraft()
  confirmReset.value = false
}
</script>

<style scoped>
.settings {
  max-width: 46rem;
}
.block-title {
  margin: 2rem 0 0.75rem;
  font-size: 1rem;
}
.block-title:first-of-type {
  margin-top: 0;
}
.modes {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.mode {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--r);
  background: var(--bg);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.mode:hover {
  border-color: var(--faint);
}
.mode[aria-checked='true'] {
  border-color: var(--ink);
  box-shadow: inset 0 0 0 1px var(--ink);
}
.mode-icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex: none;
  border-radius: var(--r-sm);
  background: var(--panel);
}
.mode-text {
  display: grid;
  flex: 1;
  font-size: 0.875rem;
}
.mode-text span {
  color: var(--muted);
}
.mode-now {
  flex: none;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--panel);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 650;
}
.card {
  display: grid;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
  font-size: 0.9375rem;
}
.form {
  display: grid;
  gap: 1rem;
}
.f {
  display: grid;
  gap: 0.375rem;
  min-width: 0;
}
.f .help {
  margin: 0;
}
.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
.grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.steps {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.7;
}
.steps strong {
  color: var(--ink);
  font-weight: 600;
}
.steps a,
.who a {
  color: var(--sky);
}
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.row-actions .btn {
  cursor: pointer;
}
.who {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}
.who img,
.who-icon {
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  border-radius: 50%;
}
.who-icon {
  display: grid;
  place-items: center;
  background: var(--panel);
}
.muted {
  margin-top: 0.125rem;
  color: var(--muted);
  font-size: 0.875rem;
}
.pw summary {
  color: var(--sky);
  font-size: 0.875rem;
  font-weight: 550;
  cursor: pointer;
}
.pw .form {
  margin-top: 0.875rem;
}
.theme {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.seg {
  display: inline-flex;
  padding: 0.1875rem;
  border-radius: 999px;
  background: var(--panel);
}
.seg button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2rem;
  padding: 0 0.875rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 550;
  cursor: pointer;
}
.seg button[aria-checked='true'] {
  background: var(--bg);
  color: var(--ink);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
}
code {
  padding: 0.0625rem 0.3125rem;
  border-radius: 0.25rem;
  background: var(--panel);
}
@media (max-width: 40rem) {
  .grid3,
  .grid2 {
    grid-template-columns: 1fr;
  }
}
</style>
