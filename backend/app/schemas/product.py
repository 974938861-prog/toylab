from datetime import datetime
from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: int
    parent_id: int | None = None
    name: str
    slug: str
    sort_order: int

    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: str
    category_id: int
    name: str
    slug: str | None = None
    spec: str | None = None
    description: str | None = None
    price: float
    stock: int
    stock_status: str
    module_type: str | None = None
    cover_url: str | None = None
    model_3d_url: str | None = None
    doc_url: str | None = None
    firmware_ver: str | None = None
    sales_count: int
    view_count: int

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int


class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, default=1)


class CartItemOut(BaseModel):
    id: str
    product_id: str
    quantity: int
    product: ProductOut | None = None

    model_config = {"from_attributes": True}
