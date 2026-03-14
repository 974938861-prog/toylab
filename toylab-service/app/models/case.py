import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Text, Integer, Numeric, Boolean, ForeignKey, DateTime, Date,
    Enum, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Case(Base):
    __tablename__ = "cases_"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    cover_url: Mapped[str | None] = mapped_column(String(500))
    description: Mapped[str | None] = mapped_column(Text)
    difficulty: Mapped[str | None] = mapped_column(String(50))
    estimated_time: Mapped[str | None] = mapped_column(String(50))
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    is_free: Mapped[bool] = mapped_column(Boolean, default=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    creator_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    creator_display_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    sales_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    designer_story: Mapped[str | None] = mapped_column(Text, nullable=True)
    demo_video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    preview_3d_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    creator = relationship("User")
    bom_items = relationship("CaseBomItem", back_populates="case", cascade="all, delete-orphan")
    steps = relationship("CaseStep", back_populates="case", cascade="all, delete-orphan",
                         order_by="CaseStep.step_number")
    resources = relationship("CaseResource", back_populates="case", cascade="all, delete-orphan")
    dev_logs = relationship("CaseDevLog", back_populates="case", cascade="all, delete-orphan",
                            order_by="CaseDevLog.log_date.desc()")

    def __repr__(self) -> str:
        return self.title or self.id


class CaseBomItem(Base):
    __tablename__ = "case_bom_items"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    case_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cases_.id", ondelete="CASCADE"), index=True
    )
    item_type: Mapped[str] = mapped_column(
        Enum("device", "material", "electronic", "mechanical"), default="electronic"
    )
    name: Mapped[str] = mapped_column(String(200))
    spec: Mapped[str | None] = mapped_column(String(500))
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    required_qty: Mapped[int] = mapped_column(Integer, default=1)
    doc_url: Mapped[str | None] = mapped_column(String(500))
    model_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    product_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("products.id")
    )

    case = relationship("Case", back_populates="bom_items")
    product = relationship("Product")

    def __repr__(self) -> str:
        return self.name or self.id


class CaseStep(Base):
    __tablename__ = "case_steps"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    case_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cases_.id", ondelete="CASCADE"), index=True
    )
    step_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500))
    video_url: Mapped[str | None] = mapped_column(String(500))
    duration_minutes: Mapped[int | None] = mapped_column(Integer)

    case = relationship("Case", back_populates="steps")

    def __repr__(self) -> str:
        return f"Step {self.step_number}: {self.title}" if self.title else self.id


class CaseResource(Base):
    __tablename__ = "case_resources"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    case_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cases_.id", ondelete="CASCADE"), index=True
    )
    resource_type: Mapped[str] = mapped_column(String(50), default="file")
    name: Mapped[str] = mapped_column(String(200))
    file_url: Mapped[str | None] = mapped_column(String(500))
    file_size: Mapped[int | None] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    case = relationship("Case", back_populates="resources")


class CaseDevLog(Base):
    __tablename__ = "case_dev_logs"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    case_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cases_.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str | None] = mapped_column(Text)
    log_date: Mapped[date] = mapped_column(Date)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    case = relationship("Case", back_populates="dev_logs")

    def __repr__(self) -> str:
        return f"{self.title} ({self.log_date})" if self.title else self.id
