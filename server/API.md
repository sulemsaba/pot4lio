# Portfolio API

The contract between the website (and its admin page) and your own server. The server in
this folder implements it; any other server that follows it works too.

- All bodies are JSON unless stated. Times are ISO 8601 in UTC.
- Private endpoints need `Authorization: Bearer <token>` (from `POST /api/auth/login`).
  Without a valid token they answer `401 {"detail": "Not signed in"}`.
- Errors answer `{"detail": "<plain message>"}` with a 4xx status.
- CORS allows the origins listed in `ALLOWED_ORIGINS` (for GitHub Pages that is
  `https://sulemsaba.github.io`, with no path).

## Content

The site's content is a set of named collections, one per file in `src/data/`:

`profile`, `copy`, `words`, `projects`, `experience`, `skills`, `education`,
`certificates`, `cv`, `essays`, `tools`

Each value is exactly what the matching `src/data/<key>.json` file holds. The server does
not look inside them, so new fields never need a server change.

### `GET /api/content` (public)

```json
{ "version": 12, "updatedAt": "2026-11-27T09:30:00Z", "collections": { "profile": {}, "projects": [] } }
```

Sends `ETag: W/"v12"`; a request with `If-None-Match: W/"v12"` gets `304`.
Before the first save it answers `{"version": 0, "updatedAt": null, "collections": {}}`, and the
site keeps the content it was built with.

### `PUT /api/content` (private)

```json
{ "baseVersion": 12, "message": "New project: MangiPlus wins", "collections": { "projects": [] } }
```

Replaces only the collections it is given; the others stay as they are. Unknown keys are
refused (`422`). If `baseVersion` is given and is not the current version, nothing is
saved and it answers `409 {"detail": "...", "version": 13}`, so two devices never overwrite each
other silently. Success: `200 {"version": 13, "updatedAt": "..."}`. Body limit: 5 MB.

### `GET /api/versions` (private)

Newest first, at most 50:
`[{"id": 13, "version": 13, "createdAt": "...", "message": "...", "keys": ["projects"], "by": "you@example.com"}]`

### `GET /api/versions/{id}` (private)

The same fields plus `"collections"`: the whole content as it was after that save.

### `POST /api/versions/{id}/restore` (private)

Saves that snapshot again as a new version (history is never rewritten).
Answers like `PUT /api/content`.

## Sign in

### `POST /api/auth/login` (public)

`{"email": "...", "password": "..."}` gives
`200 {"token": "...", "expiresAt": "...", "user": {"email": "...", "name": "..."}}`.
Wrong details: `401`. More than 10 tries in 15 minutes from one address: `429`.

### `GET /api/auth/me` (private)

`{"email": "...", "name": "..."}`

### `POST /api/auth/password` (private)

`{"current": "...", "next": "..."}` (next: at least 10 characters) gives `204`.
Every token issued before the change stops working, the current one too, so the admin
page signs in again with the new password.

## Images

### `POST /api/media` (private, multipart)

Fields: `file` (the image, at most 10 MB) and optional `folder` (`work`, `writing` or
`uploads`, the default). The server checks it really is an image, resizes it to at most
2400 px on its long side, saves it as WebP and answers
`201 {"url": "https://api.example.com/media/work/levo-3f9a.webp", "path": "work/levo-3f9a.webp", "w": 1200, "h": 750, "size": 84211}`.
Put `url` in the content; it works on any host.

### `GET /api/media` (private)

`[{"url", "path", "w", "h", "size", "createdAt"}]`, newest first.

### `DELETE /api/media/{path}` (private)

`204`. The file is gone; content that still points to it shows a broken image.

### `GET /media/{path}` (public)

The image file itself.

## Messages (the contact form)

### `POST /api/messages` (public)

`{"name": "...", "email": "...", "phone": "...", "subject": "...", "message": "...", "page": "contact", "website": ""}`

`message` is required (1 to 5000 characters). `name`, `email`, `phone`, `subject` and
`page` are optional and short. `website` is a hidden trap field: people leave it empty,
spam bots fill it, and then the message is quietly dropped (still `201`). At most 5
messages an hour from one address (`429`). Success: `201 {"ok": true}`.

### `GET /api/messages?status=all|unread` (private)

`[{"id", "name", "email", "phone", "subject", "message", "page", "createdAt", "read"}]`,
newest first.

### `PATCH /api/messages/{id}` (private)

`{"read": true}` gives the updated message.

### `DELETE /api/messages/{id}` (private)

`204`.

## Health

### `GET /api/health` (public)

`{"ok": true, "version": "1.0.0"}`
