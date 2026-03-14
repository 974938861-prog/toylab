import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Integer, Numeric, Enum, ForeignKey, DateTime, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProductCategory(Base):
    __tablename__ = "product_categories"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    icon: Mapped[str | None] = mapped_column(String(50))
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("product_categories.id")
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    parent = relationship("ProductCategory", remote_side="ProductCategory.id")
    products = relationship("Product", back_populates="category")

    def __repr__(self) -> str:
        return self.name or str(self.id)


class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    category_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("product_categories.id"), index=True
    )
    description: Mapped[str | None] = mapped_column(Text)
    spec: Mapped[str | None] = mapped_column(String(500))
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    cover_url: Mapped[str | None] = mapped_column(String(500))
    model_3d_url: Mapped[str | None] = mapped_column(String(500))
    stock_status: Mapped[str] = mapped_column(
        Enum("in_stock", "out_of_stock", "pre_order"), default="in_stock"
    )
    is_published: Mapped[bool] = mapped_column(default=False)
    sales_count: Mapped[int] = mapped_column(Integer, default=0)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    category = relationship("ProductCategory", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return self.name or self.id


class ProductImage(Base):
    __tablename__ = "product_images"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    image_url: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    product = relationship("Product", back_populates="images")

    def __repr__(self) -> str:
        return f"图片 #{self.sort_order}" if self.sort_order is not None else str(self.id)
