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

Everything the site says is in `src/content.js`, in English (`en`) and Kiswahili (`sw`):

- `profile`: name, city, photo and links (email, WhatsApp, GitHub, LinkedIn, CV). Empty links are hidden. The photo is `public/suleiman.webp`; replace that file to change it.
- `copy`: every sentence on the site, page by page, including the story on the About page. In the story, `**words like this**` show a little stronger.
- `projects`: name, type, status, summary, link, images and `tint` (the colour behind the images). Images live in `public/work/`. Each project also has a `pitch` (one line on what it does for people), `wins` (its advantages, shown as ticks) and `ask` (the WhatsApp message behind "Want one like this?"). Keep these to real advantages; never invent numbers.
- `copy.needs`: the "What does your business need?" picker on Home and Work: one entry per choice, with its points, an example and a ready-made WhatsApp message.
- `greetings`: the words the greeting card cycles through, one per language spoken.
- `experience`, `education`, `skills`, `certificates`: the lists under About.
- `src/writing.js`: the essays on the Writing page, newest first. Each has a `slug` (its link), `topic`, `tone` (`sand`, `palm`, `sky` or empty), `date`, `title`, `dek` and `body`. In the body a string is a paragraph, `{ h }` a heading, `{ q, by }` a quotation and `{ list }` a list; `**bold**` and `*italic*` work inside. The essays are in English; the page around them follows the language switch. Each essay has a photo in `public/writing/` (`<slug>.webp`, up to 1600px wide, and `<slug>-sm.webp`, 800px wide) with its credit in `image`; the photos come from Wikimedia Commons and every one is credited under its essay with its licence.
- `src/tools.js`: the "Tools I use" card on About, in three groups. Logos come from Simple Icons (CC0); Excel, Power BI, Matplotlib, SQL and VS Code get plain line drawings. Add or remove a tool there.

The contact box sends visitors to WhatsApp with their message already typed, using the number in `profile.links.whatsapp`.

The menu has five pages: Home, About, Work, Writing and Contact (`#/`, `#/about`, `#/work`, `#/writing`, `#/contact`). The CV (`#/cv`) is linked from the footer of every page and from Home. The footer ends with a changing sign-off (`sayWords` in `src/content.js`) and a strip of grass that grows up the first time it comes into view, which visitors can brush, tap, or push with the arrow keys (`src/components/GrassField.vue`). `#/work/ligiplay` (or any project id) opens the Work page at that project. Writing lists the essays, with a search (titles, summaries and full text, accents ignored) and topic buttons; the search and topic stay set while a reader opens an essay and comes back. `#/writing/<slug>` opens one essay; on wide screens its contents sit fixed at the left, halfway down the screen, mark the section being read and jump to any section, and on smaller screens they fold into a box before the text. The old `#/play` link opens Writing.

The CV page shows the CV from `src/cv.js`, with buttons to download the PDF or print. The PDF (`public/suleiman-msaba-cv.pdf`) is printed from that same page, so after editing `src/cv.js` run `npm run cv:pdf` (it needs Chrome or Chromium installed) and the download matches again.

Referees appear on the public CV by name and role only. Their phone numbers and emails live in `private/referees.json`, which is not in git. `npm run cv:pdf:private` prints `private/Suleiman-Msaba-CV-with-referees.pdf`, the full CV to send with job applications.

Visitors can switch between a light and a dark theme with the sun and moon button; the site starts in their system's theme and remembers their choice.

Visitors can switch language with EN / SW, or you can share a link that opens in Kiswahili: `?lang=sw`.

## Publish for free

**GitHub Pages (already set up).** In the repository on GitHub, open *Settings → Pages* and set *Source* to *GitHub Actions*. Every push to `main` then publishes the site to `https://sulemsaba.github.io/pot4lio/`.

**Netlify, Vercel or Cloudflare Pages.** Import the repository, use the build command `npm run build` and the output folder `dist`. Set the environment variable `SITE_URL` to the final address (for example `https://suleiman.netlify.app`) so link previews on WhatsApp and LinkedIn show the right image.
