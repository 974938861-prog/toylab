from datetime import datetime, date
from pydantic import BaseModel, Field

from app.schemas.user import UserOut


class CaseBomItemOut(BaseModel):
    id: str
    item_type: str
    name: str
    spec: str | None = None
    unit_price: float | None = None
    required_qty: int
    product_id: str | None = None

    model_config = {"from_attributes": True}


class CaseStepOut(BaseModel):
    id: str
    step_number: int
    title: str
    description: str | None = None
    image_url: str | None = None

    model_config = {"from_attributes": True}


class CaseResourceOut(BaseModel):
    id: str
    resource_type: str
    name: str
    description: str | None = None
    file_format: str | None = None
    file_url: str | None = None

    model_config = {"from_attributes": True}


class CaseDevLogOut(BaseModel):
    id: str
    log_type: str
    content: str
    logged_at: date

    model_config = {"from_attributes": True}


class CaseListOut(BaseModel):
    id: str
    title: str
    summary: str | None = None
    category: str | None = None
    cover_url: str | None = None
    estimated_time: str | None = None
    price: float
    view_count: int
    purchase_count: int
    creator: UserOut | None = None

    model_config = {"from_attributes": True}


class CaseDetailOut(CaseListOut):
    preview_3d_url: str | None = None
    video_url: str | None = None
    designer_story: str | None = None
    bom_items: list[CaseBomItemOut] = []
    steps: list[CaseStepOut] = []
    resources: list[CaseResourceOut] = []
    dev_logs: list[CaseDevLogOut] = []
    created_at: datetime
    updated_at: datetime


class CaseCreate(BaseModel):
    title: str = Field(max_length=200)
    summary: str | None = None
    category: str | None = None
    estimated_time: str | None = None
    price: float = 0
    designer_story: str | None = None


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentOut(BaseModel):
    id: str
    user: UserOut
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FavoriteCreate(BaseModel):
    target_type: str  # case / product
    target_id: str


class FavoriteOut(BaseModel):
    id: str
    target_type: str
    target_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
