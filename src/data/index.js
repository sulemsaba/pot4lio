// The site's content collections, as built into the site. Each one is a JSON file in this
// folder; the admin page edits them and publishes them back here (see README.md).
import profile from './profile.json'
import copy from './copy.json'
import words from './words.json'
import projects from './projects.json'
import experience from './experience.json'
import skills from './skills.json'
import education from './education.json'
import certificates from './certificates.json'
import cv from './cv.json'
import essays from './essays.json'
import tools from './tools.json'

export const bundled = { profile, copy, words, projects, experience, skills, education, certificates, cv, essays, tools }
export const KEYS = Object.keys(bundled)
export const fileOf = (key) => `src/data/${key}.json`
