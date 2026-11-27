# Suleiman Msaba

Personal portfolio: websites, Android apps and business systems, built in Dar es Salaam. English and Kiswahili.

Built with Vue 3 and Vite. The finished site is plain static files, so it can be hosted for free.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production files in dist/
npm run preview  # check the production build
```

## Edit the content

Open the admin page: `http://localhost:3000/admin/` while `npm run dev` runs, or
`https://sulemsaba.github.io/pot4lio/admin/` on the live site. It edits everything the
site says, in English and Kiswahili side by side: profile and links, projects (with their
pictures), essays, the About page, the CV, the Kiswahili words and every other line of
site text. A preview beside the editor shows the real site with your changes as you type.

The content itself is a set of JSON files in `src/data/`, one per part of the site;
`src/data/README.md` explains each one. The admin page and the site both read them, so
you can also edit them by hand.

### Where the admin page saves

Your edits are saved in your browser as you type (a draft). Publishing sends them on, to
one of three places you choose in the admin page's Settings:

- **This browser only.** Nothing leaves the browser. Save a copy of the content file and
  run `npm run content -- import <file>` here, then deploy.
- **GitHub (no server needed).** With a fine-grained GitHub token that can only write to
  this repository (Settings in the admin page shows how to make one), Publish writes the
  changed files and new pictures to `main` as one commit. The deploy workflow then rebuilds
  the site in about a minute. Every publish is a commit, so the history is on GitHub.
- **Your own server.** For when you have one: see below.

Anyone can open the admin page, but without your token or your server password their edits
stay in their own browser. The page is marked `noindex`, so search engines skip it.

Before publishing, the admin page lists what will change, and its Overview flags what needs
a look: missing Kiswahili, pictures with no description, long dashes, two projects with the
same address, and referee contact details (which must stay private).

### Visitor statistics

The site can count its visitors with Umami (free at cloud.umami.is): countries and cities,
devices, browsers, pages, where visitors came from and when, plus clicks on the CV,
WhatsApp, email and phone links (`src/analytics.js`). It sets no cookies and identifies
nobody. It stays off until you paste your Umami website ID in the admin page (Profile and
links, Visitor statistics) and publish, and it never counts visits from your own computer
(localhost) or from the draft preview.

## Your own server (later)

`server/` holds a small API (FastAPI, SQLite or PostgreSQL) for when you own a server; its
`README.md` explains how to run and deploy it, and `server/API.md` is the contract between
it and the site. With it connected:

- the site loads its content from the server, so a publish shows at once, with no rebuild;
- pictures upload straight to the server;
- the contact form sends messages to the admin page's Inbox, instead of opening the
  visitor's email app;
- every publish is kept, and any earlier version can be restored.

To switch it on, set the repository variable `VITE_API_URL` (GitHub, *Settings, Secrets
and variables, Actions, Variables*) to the server's address and run the deploy again, then
sign in under Settings in the admin page. Until then the site works exactly as now, from
`src/data/`.

The contact box sends visitors to WhatsApp with their message already typed, using the number in `profile.links.whatsapp`.

The menu has five pages: Home, About, Work, Writing and Contact (`#/`, `#/about`, `#/work`, `#/writing`, `#/contact`). The CV (`#/cv`) is linked from the footer of every page and from Home. The footer ends with a sign-off whose middle word rolls to the next one letter by letter (`sayWords` in `src/data/copy.json`, `src/components/WordRoll.vue`) and a strip of grass that grows up the first time it comes into view, which visitors can brush, tap, or push with the arrow keys (`src/components/GrassField.vue`). A road light stands at the right end of the grass (`src/components/StreetLight.vue`): off by day, and at night it flickers on and lights the grass below its arm. `#/work/ligiplay` (or any project id) opens the Work page at that project. Writing lists the essays, with a search (titles, summaries and full text, accents ignored) and topic buttons; the search and topic stay set while a reader opens an essay and comes back. `#/writing/<slug>` opens one essay; on wide screens its contents sit fixed at the left, halfway down the screen, mark the section being read and jump to any section, and on smaller screens they fold into a box before the text. The old `#/play` link opens Writing.

The CV page shows the CV from `src/data/cv.json`, with buttons to download the PDF or print. The PDF (`public/suleiman-msaba-cv.pdf`) is printed from that same page on every deploy, so the download always matches; `npm run cv:pdf` prints it on your computer too (it needs Chrome or Chromium installed). For one application, a tailored CV (its own headline, profile, skills or order of sections) can be written as `private/<name>.json` and printed with `node scripts/cv-pdf.mjs --private --variant private/<name>.json`; it is built separately inside `private/`, so it never reaches git or the website.

Referees appear on the public CV by name and role only. Their phone numbers and emails live in `private/referees.json`, which is not in git. `npm run cv:pdf:private` prints `private/Suleiman-Msaba-CV-with-referees.pdf`, the full CV to send with job applications.

Visitors switch between the light and the dark theme with the pull cord at the top right (`src/components/PullCord.vue`), which stays on screen while the page scrolls: pull the bead down past the click, or tap it, or press Enter. The new theme spreads out from the bead (`src/theme.js`). The site starts in their system's theme and remembers their choice.

On Home, a small website in a frame shows the site's responsive work: drag its edge (or pick Phone, Tablet or Desktop) and its layout really changes, through container queries (`src/components/ResponsivePlay.vue`). The menu's pill stretches toward the new page on two springs (`src/components/NavPill.vue`). On the Work page each website is shown on a desktop and on a phone (`phone` in `projects`), and on phones each project's advantages fold away behind their title. After the projects, a motion section shows Fade Arc, Suleiman's loader animation contributed to DesignBookmark (`src/components/FadeArc.vue`, `MotionShowcase.vue`).

The pull cord, the menu pill and the rolling word are adapted from DesignBookmark's motion studies (designbookmark.com/motion) and keep their spring values (stiffness and damping, in `src/motion.js`). Every animation sleeps when nothing moves and calms down with reduced motion.

Visitors can switch language with EN / SW, or you can share a link that opens in Kiswahili: `?lang=sw`.

## Publish for free

**GitHub Pages (already set up).** In the repository on GitHub, open *Settings → Pages* and set *Source* to *GitHub Actions*. Every push to `main` then publishes the site to `https://sulemsaba.github.io/pot4lio/`.

**Netlify, Vercel or Cloudflare Pages.** Import the repository, use the build command `npm run build` and the output folder `dist`. Set the environment variable `SITE_URL` to the final address (for example `https://suleiman.netlify.app`) so link previews on WhatsApp and LinkedIn show the right image.
