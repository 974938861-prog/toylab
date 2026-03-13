from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.order import CartItem
from app.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["购物车"])


class CartBody(BaseModel):
    product_id: str


@router.post("")
async def add_to_cart(
    body: CartBody,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current["id"],
            CartItem.product_id == body.product_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.execute(
            update(CartItem)
            .where(CartItem.id == existing.id)
            .values(quantity=CartItem.quantity + 1)
        )
    else:
        item = CartItem(user_id=current["id"], product_id=body.product_id, quantity=1)
        db.add(item)

    return {"ok": True}
