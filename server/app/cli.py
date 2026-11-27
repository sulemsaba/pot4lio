"""Jobs for the terminal. Run from the server folder:

  python -m app.cli create-admin --email you@example.com --name "Your Name"
  python -m app.cli seed ../src/data      (load the website's content files)
  python -m app.cli export ../src/data    (write the content back to those files)
"""

import argparse
import getpass
import json
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from .content import read_content, save_content
from .db import Base, User, make_engine
from .security import hash_password
from .settings import KEYS, Settings, load_settings


def ask_password() -> str:
    first = getpass.getpass("New password (at least 10 characters): ")
    if len(first) < 10:
        raise SystemExit("The password needs at least 10 characters.")
    if getpass.getpass("Type it again: ") != first:
        raise SystemExit("The two passwords are different.")
    return first


def main(argv: list[str] | None = None, settings: Settings | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m app.cli", description="Portfolio server jobs")
    jobs = parser.add_subparsers(dest="job", required=True)
    admin = jobs.add_parser("create-admin", help="create an admin, or set a new password for one")
    admin.add_argument("--email", required=True)
    admin.add_argument("--name", default="")
    seed = jobs.add_parser("seed", help="load <key>.json files from a folder as one new version")
    seed.add_argument("folder", type=Path)
    export = jobs.add_parser("export", help="write every collection to <key>.json files in a folder")
    export.add_argument("folder", type=Path)
    args = parser.parse_args(argv)

    settings = settings or load_settings()
    engine = make_engine(settings.database_url)
    Base.metadata.create_all(engine)
    sessions = sessionmaker(engine, expire_on_commit=False)

    with sessions() as db:
        if args.job == "create-admin":
            email = args.email.strip().lower()
            password = ask_password()
            user = db.scalar(select(User).where(User.email == email))
            if user:
                user.password_hash = hash_password(password, settings.bcrypt_rounds)
                user.token_version += 1
                if args.name:
                    user.name = args.name
                print(f"New password set for {email}.")
            else:
                db.add(User(email=email, name=args.name, password_hash=hash_password(password, settings.bcrypt_rounds)))
                print(f"Admin {email} created.")
            db.commit()
            return 0

        if args.job == "seed":
            found = {}
            for key in KEYS:
                file = args.folder / f"{key}.json"
                if file.is_file():
                    found[key] = json.loads(file.read_text(encoding="utf-8"))
            if not found:
                print(f"No content files found in {args.folder}.", file=sys.stderr)
                return 1
            version, _ = save_content(db, found, None, "Seeded from files", "cli")
            print(f"Saved version {version}: {', '.join(found)}")
            return 0

        version, _, collections = read_content(db)
        if not collections:
            print("There is no content on the server yet.", file=sys.stderr)
            return 1
        args.folder.mkdir(parents=True, exist_ok=True)
        for key, value in collections.items():
            (args.folder / f"{key}.json").write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Wrote version {version} to {args.folder}: {', '.join(collections)}")
        return 0


if __name__ == "__main__":
    sys.exit(main())
