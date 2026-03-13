from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["认证"])

AVATAR_COLORS = ["#7C3AED", "#059669", "#DC2626", "#D97706", "#0284C7", "#BE185D"]


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    username: str


def _user_dict(u: User) -> dict:
    role = getattr(u.role, "value", u.role) if u.role else "user"
    return {
        "id": u.id, "email": u.email, "username": u.username,
        "nickname": u.nickname, "avatar_url": u.avatar_url,
        "avatar_color": u.avatar_color, "bio": u.bio, "role": role,
        "created_at": str(u.created_at) if u.created_at else "",
        "updated_at": str(u.updated_at) if u.updated_at else "",
    }


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "用户不存在")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "密码错误")
    role = getattr(user.role, "value", user.role) if user.role else "user"
    token = create_token({"id": user.id, "email": user.email, "role": role})
    return {"token": token, "user": _user_dict(user)}


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(User).where((User.email == body.email) | (User.username == body.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "邮箱或用户名已存在")

    import random
    color = random.choice(AVATAR_COLORS)
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        username=body.username,
        nickname=body.username,
        avatar_color=color,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    role = getattr(user.role, "value", user.role) if user.role else "user"
    token = create_token({"id": user.id, "email": user.email, "role": role})
    return {"token": token, "user": _user_dict(user)}


@router.get("/me")
async def me(
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "用户不存在")
    return {"user": _user_dict(user)}
