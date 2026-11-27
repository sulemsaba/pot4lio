"""Sign in, who am I, and changing the password."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import User, iso
from ..deps import client_ip, current_user, get_db
from ..security import hash_password, make_token, verify_password

router = APIRouter(prefix="/api/auth")


class LoginIn(BaseModel):
    email: str = Field(max_length=200)
    password: str = Field(max_length=500)


class PasswordIn(BaseModel):
    current: str = Field(max_length=500)
    next: str = Field(min_length=10, max_length=500)


def user_out(user: User) -> dict:
    return {"email": user.email, "name": user.name}


@router.post("/login")
def login(body: LoginIn, request: Request, db: Session = Depends(get_db)):
    state = request.app.state
    if not state.login_limiter.allow(client_ip(request)):
        raise HTTPException(status_code=429, detail="Too many sign-in attempts. Wait 15 minutes, then try again.")
    user = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    # Check a password even for an unknown email, so both take the same time.
    ok = verify_password(body.password, user.password_hash if user else state.dummy_hash)
    if not user or not ok:
        raise HTTPException(status_code=401, detail="Wrong email or password")
    settings = state.settings
    token, expires = make_token(user.id, user.token_version, settings.secret_key, settings.token_hours)
    return {"token": token, "expiresAt": iso(expires), "user": user_out(user)}


@router.get("/me")
def me(user: User = Depends(current_user)):
    return user_out(user)


@router.post("/password", status_code=204)
def change_password(body: PasswordIn, request: Request, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if not verify_password(body.current, user.password_hash):
        raise HTTPException(status_code=400, detail="The current password is wrong")
    user.password_hash = hash_password(body.next, request.app.state.settings.bcrypt_rounds)
    user.token_version += 1  # every device signs in again with the new password
    db.commit()
    return Response(status_code=204)
