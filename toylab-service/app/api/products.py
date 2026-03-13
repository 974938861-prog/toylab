from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product, ProductCategory

router = APIRouter(prefix="/api", tags=["商品"])


PRODUCT_PLACEHOLDER_IMG = "https://placehold.co/200x200/059669/white?text=Part"

@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).order_by(Product.created_at.desc()))
    products = result.scalars().all()
    return [
        {
            "id": p.id, "name": p.name, "slug": p.slug,
            "category_id": p.category_id, "description": p.description,
            "spec": p.spec, "price": float(p.price or 0),
            "cover_url": p.cover_url or PRODUCT_PLACEHOLDER_IMG, "model_3d_url": p.model_3d_url,
            "stock_status": p.stock_status,
            "sales_count": p.sales_count, "view_count": p.view_count,
            "created_at": str(p.created_at), "updated_at": str(p.updated_at),
        }
        for p in products
    ]


@router.get("/product-categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ProductCategory).order_by(ProductCategory.sort_order)
    )
    cats = result.scalars().all()
    return [
        {"id": c.id, "name": c.name, "slug": c.slug,
         "icon": c.icon, "parent_id": c.parent_id, "sort_order": c.sort_order}
        for c in cats
    ]
