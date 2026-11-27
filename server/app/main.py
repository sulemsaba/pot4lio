"""The app uvicorn runs: uvicorn app.main:app"""

from .api import create_app

app = create_app()
