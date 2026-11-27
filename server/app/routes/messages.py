"""The contact form: anyone may send a message; only you can read them."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import Message, User, iso
from ..deps import client_ip, current_user, get_db

router = APIRouter(prefix="/api/messages")


class MessageIn(BaseModel):
    name: str | None = Field(default="", max_length=120)
    email: str | None = Field(default="", max_length=200)
    phone: str | None = Field(default="", max_length=40)
    subject: str | None = Field(default="", max_length=200)
    message: str = Field(max_length=5000)
    page: str | None = Field(default="", max_length=100)
    website: str | None = Field(default="", max_length=500)  # the trap: people leave it empty

    @field_validator("message")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Write a message first")
        return value.strip()


class MessagePatch(BaseModel):
    read: bool


def message_out(row: Message) -> dict:
    return {
        "id": row.id,
        "name": row.name,
        "email": row.email,
        "phone": row.phone,
        "subject": row.subject,
        "message": row.message,
        "page": row.page,
        "createdAt": iso(row.created_at),
        "read": row.read,
    }


@router.post("", status_code=201)
def send_message(body: MessageIn, request: Request, db: Session = Depends(get_db)):
    if not request.app.state.message_limiter.allow(client_ip(request)):
        raise HTTPException(status_code=429, detail="Too many messages from here. Try again in an hour, or use email or WhatsApp.")
    if (body.website or "").strip():
        return {"ok": True}  # a bot filled the trap: say thanks, keep nothing
    clean = lambda value: (value or "").strip()  # noqa: E731
    db.add(
        Message(
            name=clean(body.name),
            email=clean(body.email),
            phone=clean(body.phone),
            subject=clean(body.subject),
            message=body.message,
            page=clean(body.page),
        )
    )
    db.commit()
    return {"ok": True}


@router.get("")
def list_messages(status: Literal["all", "unread"] = "all", _: User = Depends(current_user), db: Session = Depends(get_db)):
    query = select(Message).order_by(Message.created_at.desc(), Message.id.desc())
    if status == "unread":
        query = query.where(Message.read.is_(False))
    return [message_out(row) for row in db.scalars(query)]


def find_message(db: Session, message_id: int) -> Message:
    row = db.get(Message, message_id)
    if not row:
        raise HTTPException(status_code=404, detail="There is no such message")
    return row


@router.patch("/{message_id}")
def mark_message(message_id: int, body: MessagePatch, _: User = Depends(current_user), db: Session = Depends(get_db)):
    row = find_message(db, message_id)
    row.read = body.read
    db.commit()
    return message_out(row)


@router.delete("/{message_id}", status_code=204)
def delete_message(message_id: int, _: User = Depends(current_user), db: Session = Depends(get_db)):
    db.delete(find_message(db, message_id))
    db.commit()
    return Response(status_code=204)
