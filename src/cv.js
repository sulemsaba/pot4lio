// The CV: shown on the CV page, and printed from that page to the PDF in /public
// (run `npm run cv:pdf`), so the two always match. Keep it short and scannable:
// one line per point, facts only.
import { site } from './site.js'

// The CV itself is src/data/cv.json, edited from the admin page. Referees there are names
// and roles only. Their phone numbers and emails are private: they live in
// private/referees.json (not in git) and only go into the private PDF
// (npm run cv:pdf:private), never into the website.
const base = site.cv

// A tailored version for one application (a different headline, profile, order of
// sections...) can replace parts of the CV. It comes from a file in private/ and only
// the PDF script passes it in, at build time (VITE_CV_VARIANT); the website never has it.
const variant = import.meta.env.VITE_CV_VARIANT ? JSON.parse(import.meta.env.VITE_CV_VARIANT) : null

export const cv = variant ? { ...base, ...variant } : base
