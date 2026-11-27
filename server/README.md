# Portfolio server

The website works without this server: it is built from the files in `src/data/` and
hosted for free on GitHub Pages. This server is for the day you have one. It makes the
site dynamic:

- **Content** from the database. Save in the admin page and the site shows it at once,
  with no new deploy. Every save is a numbered version you can go back to.
- **Images** uploaded from the admin page, checked and saved as WebP.
- **Messages** from the contact form, in an inbox on the admin page.
- **Sign in** with your email and password.

It is a FastAPI app. It uses SQLite on your computer and PostgreSQL on a server. The
contract between the site and the server is in [API.md](API.md).

## Run it on your computer

```sh
cd server
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
python -m app.cli seed ../src/data
python -m app.cli create-admin --email you@example.com --name "Suleiman Msaba"
uvicorn app.main:app --reload --port 8000
```

- `seed` copies the website's current content into the database, as version 1.
- `create-admin` asks for a password (at least 10 characters). Run it again with the same
  email to set a new password.
- Open http://localhost:8000/api/health to check it runs. In development the API is also
  described at http://localhost:8000/docs.
- The database and images go in `server/data/` (not in git).

To try the website against it: start the site with `VITE_API_URL=http://localhost:8000 npm run dev`
in the main folder, then open the admin page at http://localhost:3000/admin/.

## Tests

```sh
pytest
```

## Settings

All in `.env` (see `.env.example`). The ones that matter:

| Name | What it is |
| --- | --- |
| `ENV` | `development` on your computer, `production` on a server. |
| `SECRET_KEY` | A long random value that signs the sign-in tokens. Required in production. Make one with `python -c "import secrets; print(secrets.token_urlsafe(48))"`. |
| `DATABASE_URL` | SQLite by default. `postgresql+psycopg://user:password@host:5432/name` for PostgreSQL. The `postgres://` form that hosts give also works. |
| `ALLOWED_ORIGINS` | The websites allowed to call the server, comma separated, no path. For GitHub Pages: `https://sulemsaba.github.io`. |
| `PUBLIC_URL` | The server's own address, used in image links, such as `https://api.yourdomain.com`. |
| `MEDIA_DIR` | Where images are saved. Default `./data/media`. |
| `TOKEN_HOURS` | How long a sign-in lasts. Default 12. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | If set, the first admin is created on start, once, when there is no admin yet. |

## Put it online

### Option 1: your own VPS, with Docker and Caddy

1. Point a domain at the server, for example an `A` record for `api.yourdomain.com`.
2. Install Docker and Caddy on the server, and copy this repository there.
3. In `server/`, run `cp .env.example .env` and fill it in: `ENV=production`, a new
   `SECRET_KEY`, a `POSTGRES_PASSWORD` (letters and numbers only),
   `ALLOWED_ORIGINS=https://sulemsaba.github.io`, `PUBLIC_URL=https://api.yourdomain.com`,
   and `ADMIN_EMAIL` and `ADMIN_PASSWORD` for your first sign-in.
4. Start it: `docker compose up -d --build`
5. Load the content once:
   `docker compose run --rm -v "$PWD/../src/data:/seed:ro" api python -m app.cli seed /seed`
6. Caddy gives you HTTPS by itself. Put this in `/etc/caddy/Caddyfile`, then run
   `sudo systemctl reload caddy`:

   ```
   api.yourdomain.com {
       reverse_proxy 127.0.0.1:8000
   }
   ```

The API only listens on `127.0.0.1`, so the world reaches it through Caddy alone.

### Option 2: a hosting service (Render, Railway, Fly.io)

1. Create a PostgreSQL database on the service.
2. Create a web service from this repository, with `server` as its root folder. It finds
   the `Dockerfile` by itself.
3. Set the settings above as environment variables. Use the database address the service
   gives you as `DATABASE_URL`.
4. Add a persistent disk (or volume) mounted at `/app/data`. Without one, uploaded images
   disappear at every redeploy.
5. Load the content once from your computer: put the service's database address in your
   local `.env` as `DATABASE_URL`, then run `python -m app.cli seed ../src/data`.

## Connect the website

1. On GitHub, open the repository, then **Settings**, **Secrets and variables**,
   **Actions**, the **Variables** tab, and add a repository variable named `VITE_API_URL`
   with the server's address, such as `https://api.yourdomain.com` (no `/` at the end).
2. Deploy the site again: push to `main`, or run the **Deploy to GitHub Pages** workflow
   from the Actions tab. The deploy passes `VITE_API_URL` to the build.
3. Make sure `ALLOWED_ORIGINS` on the server includes `https://sulemsaba.github.io` (and
   your own domain, if the site moves to one).
4. Open the admin page, https://sulemsaba.github.io/pot4lio/admin/, go to **Settings**,
   **Server**, enter the address and sign in.

From then on the site reads its content from the server. The files in `src/data/` stay
as the copy the site was built with: visitors see that copy if the server is ever down.
To bring the server's content back into the repository, run
`python -m app.cli export ../src/data` and commit the files.

## Backups

- PostgreSQL with Docker:
  `docker compose exec db pg_dump -U portfolio portfolio > backup-$(date +%F).sql`.
  To restore: `docker compose exec -T db psql -U portfolio portfolio < backup-2026-11-27.sql`
- Images with Docker: `docker compose cp api:/app/data/media ./media-backup`
- SQLite: stop the server and copy the `data/` folder.
- Every save is also a version: the admin page can restore any of the last 50.

## Safety

- Passwords are stored as bcrypt hashes. Changing the password signs out every device.
- Sign-in: at most 10 tries in 15 minutes from one address. Contact form: at most 5
  messages an hour from one address, and a hidden trap field catches most bots.
- Uploads must be real images (no SVG). They are re-saved as WebP, which drops camera
  details and location.
- Content is limited to 5 MB a save, images to 10 MB.
- Keep `.env` private. It is in `.gitignore`.
