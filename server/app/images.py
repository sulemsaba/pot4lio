"""Checking uploaded images and saving them as clean WebP files."""

import io
import re
import secrets
import warnings
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

FOLDERS = ("work", "writing", "uploads")
MAX_SIDE = 2400
MAX_BYTES = 10 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 80_000_000  # bigger than any phone photo; stops "decompression bombs"


class NotAnImage(ValueError):
    pass


def to_webp(data: bytes) -> tuple[bytes, int, int]:
    """Open the upload, turn it upright, shrink it to MAX_SIDE and save it as WebP.

    Saving a fresh file drops everything but the pixels (camera details, GPS location...).
    """
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as probe:
                probe.verify()
            image = Image.open(io.BytesIO(data))
            image.load()
    except (UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning, OSError, SyntaxError, ValueError) as error:
        raise NotAnImage(str(error)) from None
    image = ImageOps.exif_transpose(image)
    has_alpha = image.mode in ("RGBA", "LA", "PA") or (image.mode == "P" and "transparency" in image.info)
    image = image.convert("RGBA" if has_alpha else "RGB")
    image.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
    out = io.BytesIO()
    image.save(out, format="WEBP", quality=85, method=4)
    return out.getvalue(), image.width, image.height


def slug(filename: str | None) -> str:
    stem = Path(filename or "").stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")[:40].strip("-")
    return stem or "image"


def new_path(media_dir: Path, folder: str, filename: str | None) -> str:
    base = slug(filename)
    while True:
        path = f"{folder}/{base}-{secrets.token_hex(2)}.webp"
        if not (media_dir / path).exists():
            return path


def safe_file(media_dir: Path, path: str) -> Path | None:
    """The file for `path`, only if it sits inside media_dir (no ../ tricks)."""
    try:
        root = media_dir.resolve()
        target = (root / path).resolve()
    except (OSError, ValueError):
        return None
    if root not in target.parents:
        return None
    return target
