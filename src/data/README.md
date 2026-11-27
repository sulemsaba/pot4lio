# The site's content

Everything the site says, one JSON file per part. The admin page (`/admin/`) edits these
files and publishes them back here; you can also edit them by hand. Text in English and
Kiswahili is written as `{ "en": "...", "sw": "..." }`. In most text, `**words like this**`
show a shade stronger. A link left empty (`""`) is hidden on the site.

- `profile.json`: name, city, time zone (for the clock), photo and links (email, WhatsApp
  in international digits, GitHub, LinkedIn, the CV file and its preview picture). The
  photo and pictures are files in `public/`.
- `copy.json`: every other line on the site, page by page, as `en` and `sw`. This includes
  the story on the About page, the "What does your business need?" picker (`needs`: one
  entry per choice, with its points, an example and a ready-made WhatsApp message), and the
  words of the footer sign-off (`sayWords`). `{n}` in a line becomes a number.
- `projects.json`: the Work page, in order. Each project has an `id` (its link,
  `#/work/<id>`), `name`, `type`, `status`, `summary`, `url`, `layout` (`phones` for tall
  app screens, `browser` for a website screenshot, `banner` for one wide picture), `tint`
  (the colour behind the images, empty for the soft grey), `pitch` (one line on what it
  does for people), `wins` (its advantages, shown as ticks), `ask` (the WhatsApp message
  behind "Want one like this?"), `images` (in `public/work/`, with a description in both
  languages) and, for websites, a `phone` screenshot. `linkLabel` replaces "Visit ..." (the
  JOTOFA proposal uses it) and `demo` shows the small LigiPlay demo. Keep wins to real
  advantages; never invent numbers.
- `essays.json`: the Writing page, newest first. Each essay has a `slug` (its link),
  `topic`, `tone` (`sand`, `palm`, `sky` or empty), `date`, `title`, `dek` and `body`. In
  the body a string is a paragraph, `{ "h" }` a heading, `{ "q", "by" }` a quotation and
  `{ "list" }` a list; `**bold**` and `*italic*` work inside. Each essay has a photo in
  `public/writing/` (`<name>.webp`, up to 1600px wide, and a small `-sm.webp`, 800px wide)
  with its credit in `image`.
- `experience.json`, `skills.json`, `education.json`, `certificates.json`: the lists on the
  About page.
- `tools.json`: the "Tools I use" card on About, in groups. Logos come from Simple Icons
  (CC0), drawn on a 24 by 24 grid; `hex` is the colour a tile lights up in and `on` the
  colour that reads on it. Excel, Power BI, Matplotlib, SQL and VS Code have no free logo,
  so they get a plain line drawing (`stroke` is its line weight).
- `words.json`: the word of Kiswahili card on Home.
- `cv.json`: the CV page and its PDF, in English. Referees here are names and roles only:
  their phone numbers and emails stay in `private/referees.json`, never on the website.

`index.js` lists the files for the site and the admin page.
