import uuid
from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserPart(Base):
    __tablename__ = "user_parts"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uk_user_parts"),
        {"extend_existing": True},
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("products.id"), index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    last_used_project: Mapped[str | None] = mapped_column(String(200))
    firmware_version: Mapped[str | None] = mapped_column(String(50))
    added_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    user = relationship("User")
    product = relationship("Product")

    def __repr__(self) -> str:
        return f"{self.product} x{self.quantity}" if self.product else self.id
