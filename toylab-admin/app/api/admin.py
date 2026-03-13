"""
管理员接口：商品 & 分类的增删改
访问需要 role == "admin" 或 "creator"
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.product import ProductCategory, Product
from app.schemas.product import ProductOut, CategoryOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/admin", tags=["管理 - 商品"])


# ── 权限检查 ──────────────────────────────────────────────
def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("admin", "creator"):
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user


# ── 分类管理 ──────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str = Field(max_length=100, examples=["输入模块"])
    slug: str = Field(max_length=50, examples=["input"])
    parent_id: int | None = Field(None, description="父分类ID，顶级分类留空")
    sort_order: int = 0


@router.get("/categories", response_model=list[CategoryOut])
async def admin_list_categories(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(
        select(ProductCategory).order_by(ProductCategory.sort_order)
    )
    return result.scalars().all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    existing = await db.execute(
        select(ProductCategory).where(ProductCategory.slug == body.slug)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"slug '{body.slug}' 已存在")
    cat = ProductCategory(**body.model_dump())
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return cat


@router.put("/categories/{cat_id}", response_model=CategoryOut)
async def update_category(
    cat_id: int,
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(
        select(ProductCategory).where(ProductCategory.id == cat_id)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    for key, val in body.model_dump(exclude_none=True).items():
        setattr(cat, key, val)
    await db.flush()
    await db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}", status_code=204)
async def delete_category(
    cat_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(
        select(ProductCategory).where(ProductCategory.id == cat_id)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    await db.delete(cat)


# ── 商品管理 ──────────────────────────────────────────────

class ProductCreate(BaseModel):
    category_id: int = Field(description="分类ID（从分类列表获取）")
    name: str = Field(max_length=200, examples=["手按开关"])
    slug: str | None = Field(None, max_length=100, examples=["push-switch"])
    spec: str | None = Field(None, max_length=300, examples=["16×16 · 4PIN · 磁吸"])
    description: str | None = None
    price: float = Field(ge=0, examples=[3.0])
    stock: int = Field(ge=0, default=0, examples=[100])
    stock_status: str = Field(default="in_stock",
                              examples=["in_stock"],
                              description="in_stock / low / out_of_stock")
    module_type: str | None = Field(None,
                                    examples=["input"],
                                    description="input / output / motor / power / mcu / wire")
    cover_url: str | None = None
    model_3d_url: str | None = None
    doc_url: str | None = None
    firmware_ver: str | None = None


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = None
    slug: str | None = None
    spec: str | None = None
    description: str | None = None
    price: float | None = Field(None, ge=0)
    stock: int | None = Field(None, ge=0)
    stock_status: str | None = None
    module_type: str | None = None
    cover_url: str | None = None
    model_3d_url: str | None = None
    doc_url: str | None = None
    firmware_ver: str | None = None
    is_published: bool | None = None


@router.get("/products", response_model=list[ProductOut])
async def admin_list_products(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """列出所有商品（含未发布）"""
    result = await db.execute(
        select(Product).order_by(Product.created_at.desc())
    )
    return result.scalars().all()


@router.post("/products", response_model=ProductOut, status_code=201)
async def create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """新增商品"""
    if body.slug:
        existing = await db.execute(
            select(Product).where(Product.slug == body.slug)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"slug '{body.slug}' 已存在")

    cat = await db.get(ProductCategory, body.category_id)
    if not cat:
        raise HTTPException(status_code=400, detail="分类不存在，请先创建分类")

    product = Product(**body.model_dump())
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """修改商品信息"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    for key, val in body.model_dump(exclude_none=True).items():
        setattr(product, key, val)
    await db.flush()
    await db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """删除商品"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    await db.delete(product)
