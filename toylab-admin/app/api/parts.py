from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.user_part import UserPart
from app.schemas.part import UserPartCreate, UserPartUpdate, UserPartOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/parts", tags=["我的零件库"])


@router.get("/", response_model=list[UserPartOut])
async def list_my_parts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserPart)
        .options(selectinload(UserPart.product))
        .where(UserPart.user_id == current_user.id)
        .order_by(UserPart.added_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=UserPartOut, status_code=201)
async def add_part(
    body: UserPartCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(UserPart).where(
            UserPart.user_id == current_user.id,
            UserPart.product_id == body.product_id,
        )
    )
    part = existing.scalar_one_or_none()
    if part:
        part.quantity += body.quantity
    else:
        part = UserPart(user_id=current_user.id, **body.model_dump())
        db.add(part)
    await db.flush()
    await db.refresh(part)
    return part


@router.put("/{part_id}", response_model=UserPartOut)
async def update_part(
    part_id: str,
    body: UserPartUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserPart).where(
            UserPart.id == part_id, UserPart.user_id == current_user.id
        )
    )
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="零件不存在")
    for key, val in body.model_dump(exclude_none=True).items():
        setattr(part, key, val)
    await db.flush()
    await db.refresh(part)
    return part


@router.delete("/{part_id}", status_code=204)
async def delete_part(
    part_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserPart).where(
            UserPart.id == part_id, UserPart.user_id == current_user.id
        )
    )
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="零件不存在")
    await db.delete(part)
