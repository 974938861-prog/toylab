import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import CartItem, Order, OrderItem
from app.api.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["订单"])


@router.post("/", status_code=201)
async def create_order(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """从购物车生成订单"""
    result = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.product))
        .where(CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="购物车为空")

    order_number = f"TL{int(time.time() * 1000)}"
    total = 0.0
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=0,
    )
    db.add(order)
    await db.flush()

    for ci in cart_items:
        subtotal = ci.product.price * ci.quantity
        total += subtotal
        db.add(OrderItem(
            order_id=order.id,
            product_id=ci.product_id,
            quantity=ci.quantity,
            unit_price=ci.product.price,
            subtotal=subtotal,
        ))
        await db.delete(ci)

    order.total_amount = total
    await db.flush()
    await db.refresh(order)

    return {
        "id": order.id,
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "status": order.status,
    }


@router.get("/")
async def list_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    return order
