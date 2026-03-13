from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.community import Favorite
from app.auth import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["收藏"])


class FavoriteBody(BaseModel):
    target_type: str
    target_id: str


@router.get("")
async def list_favorites(
    target_type: str | None = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Favorite).where(Favorite.user_id == current["id"])
    if target_type:
        q = q.where(Favorite.target_type == target_type)
    result = await db.execute(q)
    return [
        {"id": f.id, "user_id": f.user_id, "target_type": f.target_type,
         "target_id": f.target_id, "created_at": str(f.created_at)}
        for f in result.scalars().all()
    ]


@router.post("")
async def add_favorite(
    body: FavoriteBody,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current["id"],
            Favorite.target_type == body.target_type,
            Favorite.target_id == body.target_id,
        )
    )
    if not existing.scalar_one_or_none():
        fav = Favorite(user_id=current["id"], target_type=body.target_type, target_id=body.target_id)
        db.add(fav)
    return {"ok": True}


@router.delete("")
async def remove_favorite(
    body: FavoriteBody,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(Favorite).where(
            Favorite.user_id == current["id"],
            Favorite.target_type == body.target_type,
            Favorite.target_id == body.target_id,
        )
    )
    return {"ok": True}
