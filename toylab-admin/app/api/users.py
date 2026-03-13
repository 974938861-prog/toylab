from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate, UserSettingsUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["用户"])


@router.put("/me", response_model=UserOut)
async def update_profile(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.username is not None:
        current_user.username = body.username
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    if body.avatar_color is not None:
        current_user.avatar_color = body.avatar_color
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.put("/me/settings")
async def update_settings(
    body: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_settings = dict(current_user.settings or {})
    for key, val in body.model_dump(exclude_none=True).items():
        new_settings[key] = val
    current_user.settings = new_settings
    await db.flush()
    return {"ok": True, "settings": new_settings}
