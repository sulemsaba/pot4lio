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
- `src/tools.js`: the "Tools I use" card on About, in three groups. Logos come from Simple Icons (CC0); Excel, Power BI, Matplotlib, SQL and VS Code get plain line drawings. Add or remove a tool there.

The contact box sends visitors to WhatsApp with their message already typed, using the number in `profile.links.whatsapp`.

The menu has five pages: Home, About, Work, Play and Contact (`#/`, `#/about`, `#/work`, `#/play`, `#/contact`). The CV (`#/cv`) is linked from the footer of every page and from Home. The footer ends with a changing sign-off (`sayWords` in `src/content.js`) and a strip of grass that grows up the first time it comes into view, which visitors can brush, tap, or push with the arrow keys (`src/components/GrassField.vue`). `#/work/ligiplay` (or any project id) opens the Work page at that project. Play holds three one-button 3D games: Daladala (brake to stop at the bus stop), Mango drop and Keep it up, where a 3D footballer (`src/games/scenes/footballer.js`) juggles the ball you tap with his foot, thigh, chest or head. Each game's rules live in `src/games/` and its look in `src/games/scenes/` (three.js, loaded only on the Play page; day scenes in the light theme, evening scenes in the dark). `src/components/play/GameCard.vue` runs them, handles tap, mouse and keyboard, pauses a game when you tap away, and keeps each visitor's best score in their browser. To keep the games smooth on phones: still scenery is merged into a few meshes (`bake` in `src/games/scenes/stage.js`), every shader is built before play (`warm`), a game lowers its sharpness by itself if frames keep coming late (`ease`), and nothing over or around the game window may blur or cast a big CSS shadow (that made the browser repaint the window on every frame).

The CV page shows the CV from `src/cv.js`, with buttons to download the PDF or print. The PDF (`public/suleiman-msaba-cv.pdf`) is printed from that same page, so after editing `src/cv.js` run `npm run cv:pdf` (it needs Chrome or Chromium installed) and the download matches again.

Referees appear on the public CV by name and role only. Their phone numbers and emails live in `private/referees.json`, which is not in git. `npm run cv:pdf:private` prints `private/Suleiman-Msaba-CV-with-referees.pdf`, the full CV to send with job applications.

Visitors can switch between a light and a dark theme with the sun and moon button; the site starts in their system's theme and remembers their choice.

Visitors can switch language with EN / SW, or you can share a link that opens in Kiswahili: `?lang=sw`.

## Publish for free

**GitHub Pages (already set up).** In the repository on GitHub, open *Settings → Pages* and set *Source* to *GitHub Actions*. Every push to `main` then publishes the site to `https://sulemsaba.github.io/pot4lio/`.

**Netlify, Vercel or Cloudflare Pages.** Import the repository, use the build command `npm run build` and the output folder `dist`. Set the environment variable `SITE_URL` to the final address (for example `https://suleiman.netlify.app`) so link previews on WhatsApp and LinkedIn show the right image.
