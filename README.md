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

The contact box sends visitors to WhatsApp with their message already typed, using the number in `profile.links.whatsapp`.

The site has five pages: Home, About, Work, CV and Contact. Their addresses are `#/`, `#/about`, `#/work`, `#/cv` and `#/contact`, and `#/work/ligiplay` (or any project id) opens the Work page at that project.

The CV page shows the CV from `src/cv.js`, with buttons to download the PDF or print. The PDF (`public/suleiman-msaba-cv.pdf`) is printed from that same page, so after editing `src/cv.js` run `npm run cv:pdf` (it needs Chrome or Chromium installed) and the download matches again.

Visitors can switch between a light and a dark theme with the sun and moon button; the site starts in their system's theme and remembers their choice.

Visitors can switch language with EN / SW, or you can share a link that opens in Kiswahili: `?lang=sw`.

## Publish for free

**GitHub Pages (already set up).** In the repository on GitHub, open *Settings → Pages* and set *Source* to *GitHub Actions*. Every push to `main` then publishes the site to `https://sulemsaba.github.io/pot4lio/`.

**Netlify, Vercel or Cloudflare Pages.** Import the repository, use the build command `npm run build` and the output folder `dist`. Set the environment variable `SITE_URL` to the final address (for example `https://suleiman.netlify.app`) so link previews on WhatsApp and LinkedIn show the right image.
