from datetime import datetime
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(max_length=200)
    cover_type: str | None = None
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    cover_type: str | None = None
    description: str | None = None


class ProjectOut(BaseModel):
    id: str
    name: str
    cover_type: str | None = None
    cover_url: str | None = None
    description: str | None = None
    updated_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectFileUpdate(BaseModel):
    content: dict | None = None
    code_text: str | None = None


class ProjectFileOut(BaseModel):
    id: str
    file_type: str
    content: dict | None = None
    code_text: str | None = None
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectModuleCreate(BaseModel):
    module_type: str
    module_key: str
    product_id: str | None = None
    position_x: float | None = None
    position_y: float | None = None
    config: dict | None = None


class ProjectModuleOut(BaseModel):
    id: str
    module_type: str
    module_key: str
    position_x: float | None = None
    position_y: float | None = None
    config: dict | None = None

    model_config = {"from_attributes": True}
