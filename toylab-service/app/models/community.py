import uuid
from datetime import datetime

from sqlalchemy import String, Text, Enum, ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "target_type", "target_id", name="uk_favorites"),
        {"extend_existing": True},
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    target_type: Mapped[str] = mapped_column(
        Enum("case", "product")
    )
    target_id: Mapped[str] = mapped_column(String(36), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    user = relationship("User", back_populates="favorites")

    def __repr__(self) -> str:
        return f"{self.target_type}:{self.target_id[:8]}..." if self.target_id else self.id


class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    target_type: Mapped[str] = mapped_column(
        Enum("case", "product")
    )
    target_id: Mapped[str] = mapped_column(String(36), index=True)
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    user = relationship("User")

    def __repr__(self) -> str:
        return f"{self.content[:30]}..." if self.content and len(self.content) > 30 else (self.content or self.id)
