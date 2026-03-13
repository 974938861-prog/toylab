from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.product import ProductOut


class UserPartCreate(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, default=1)
    firmware_ver: str | None = None


class UserPartUpdate(BaseModel):
    quantity: int | None = Field(ge=0, default=None)
    firmware_ver: str | None = None


class UserPartOut(BaseModel):
    id: str
    product_id: str
    quantity: int
    added_at: datetime
    last_project_id: str | None = None
    firmware_ver: str | None = None
    product: ProductOut | None = None

    model_config = {"from_attributes": True}
