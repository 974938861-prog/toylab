from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.user_part import UserPart
from app.auth import get_current_user

router = APIRouter(prefix="/api/user-parts", tags=["用户零件"])


@router.get("")
async def list_user_parts(
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserPart).options(joinedload(UserPart.product)).where(UserPart.user_id == current["id"])
    )
    parts = result.unique().scalars().all()
    return [
        {
            "id": pt.id, "user_id": pt.user_id, "product_id": pt.product_id,
            "quantity": pt.quantity, "last_used_project": pt.last_used_project,
            "firmware_version": pt.firmware_version, "added_at": str(pt.added_at),
            "product": {
                "id": pt.product.id, "name": pt.product.name, "spec": pt.product.spec,
                "price": float(pt.product.price or 0), "category_id": pt.product.category_id,
            } if pt.product else None,
        }
        for pt in parts
    ]
