from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.community import Favorite
from app.schemas.case import FavoriteCreate, FavoriteOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/favorites", tags=["收藏"])


@router.get("/", response_model=list[FavoriteOut])
async def list_favorites(
    target_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Favorite).where(Favorite.user_id == current_user.id)
    if target_type:
        query = query.where(Favorite.target_type == target_type)
    query = query.order_by(Favorite.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=FavoriteOut, status_code=201)
async def add_favorite(
    body: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.target_type == body.target_type,
            Favorite.target_id == body.target_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="已收藏")
    fav = Favorite(user_id=current_user.id, **body.model_dump())
    db.add(fav)
    await db.flush()
    await db.refresh(fav)
    return fav


@router.delete("/{target_type}/{target_id}", status_code=204)
async def remove_favorite(
    target_type: str,
    target_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.target_type == target_type,
            Favorite.target_id == target_id,
        )
    )
    fav = result.scalar_one_or_none()
    if not fav:
        raise HTTPException(status_code=404, detail="未收藏")
    await db.delete(fav)
