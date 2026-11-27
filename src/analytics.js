// Visitor statistics with Umami (umami.is): which pages people open, from which country and
// city, on what device and browser, where they came from, and when. It sets no cookies and
// keeps no IP addresses, so no consent banner is needed, and nobody is identified by name.
//
// It is off until a website ID is set in the admin page (Profile and links, Visitor
// statistics), which stores it in src/data/profile.json as stats.umami. It never runs on
// your own computer, in the admin page or in its draft preview, so your visits while you
// work are not counted.
import { preview, site } from './site.js'

const CLOUD = 'https://cloud.umami.is/script.js'
let ready = false
let waiting = null

const local = () => /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(window.location.hostname)

function send(path) {
  window.umami?.track((props) => ({ ...props, url: path, title: document.title }))
}

// A few clicks worth knowing about: the CV, WhatsApp, email and phone.
function onClick(event) {
  const link = event.target.closest?.('a[href]')
  if (!link || !window.umami) return
  const href = link.getAttribute('href')
  const name = /\.pdf($|\?)/.test(href) ? 'CV download' : href.startsWith('https://wa.me/') ? 'WhatsApp' : href.startsWith('mailto:') ? 'Email' : href.startsWith('tel:') ? 'Call' : ''
  if (name) window.umami.track(name, { page: window.location.hash.replace(/^#/, '') || '/' })
}

export function startAnalytics() {
  const id = site.profile.stats?.umami?.trim()
  if (!id || preview.on || preview.framed || local()) return
  const script = document.createElement('script')
  script.defer = true
  script.src = site.profile.stats.script?.trim() || CLOUD
  script.dataset.websiteId = id
  // The site's pages live after the # in the address, so each page view is sent by hand.
  script.dataset.autoTrack = 'false'
  script.onload = () => {
    ready = true
    if (waiting) send(waiting)
    waiting = null
  }
  document.head.appendChild(script)
  document.addEventListener('click', onClick, { capture: true })
}

// Called on every page change, with an address like /work or /writing/kant-and-reality.
export function trackPage(path) {
  if (ready) send(path)
  else waiting = path
}
