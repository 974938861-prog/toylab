from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.product import Product, ProductCategory
from app.models.order import CartItem
from app.schemas.product import ProductOut, ProductListOut, CategoryOut, CartItemCreate, CartItemOut
from app.api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/shop", tags=["零件商城"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ProductCategory).order_by(ProductCategory.sort_order)
    )
    return result.scalars().all()


@router.get("/products", response_model=ProductListOut)
async def list_products(
    category: str | None = Query(None, description="分类 slug"),
    search: str | None = Query(None, description="搜索关键词"),
    sort: str = Query("recommend", description="排序: recommend/newest/popular/price_asc/price_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).where(Product.is_published == True)

    if category:
        cat_result = await db.execute(
            select(ProductCategory).where(ProductCategory.slug == category)
        )
        cat = cat_result.scalar_one_or_none()
        if cat:
            sub_result = await db.execute(
                select(ProductCategory.id).where(ProductCategory.parent_id == cat.id)
            )
            sub_ids = [r[0] for r in sub_result.all()]
            all_ids = [cat.id] + sub_ids
            query = query.where(Product.category_id.in_(all_ids))

    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

    order_map = {
        "newest": Product.created_at.desc(),
        "popular": Product.sales_count.desc(),
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
    }
    query = query.order_by(order_map.get(sort, Product.sales_count.desc()))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = result.scalars().all()

    return ProductListOut(items=items, total=total, page=page, page_size=page_size)


@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return product


@router.get("/cart", response_model=list[CartItemOut])
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.product))
        .where(CartItem.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/cart", response_model=CartItemOut, status_code=201)
async def add_to_cart(
    body: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == body.product_id,
        )
    )
    item = existing.scalar_one_or_none()
    if item:
        item.quantity += body.quantity
    else:
        item = CartItem(user_id=current_user.id, **body.model_dump())
        db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/cart/{item_id}", status_code=204)
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == item_id, CartItem.user_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="购物车项不存在")
    await db.delete(item)
