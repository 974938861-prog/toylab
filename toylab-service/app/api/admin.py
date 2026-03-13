"""管理端 API：业务统一放在 service，管理端前端只调这些接口。"""
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import UPLOAD_PATH
from app.database import get_db
from app.models.case import Case
from app.models.user import User
from app.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["管理端"])


def _case_dict(c: Case, creator: User | None = None) -> dict:
    if creator is None and c.creator:
        creator = c.creator
    role = getattr(creator.role, "value", creator.role) if creator and getattr(creator, "role", None) else "user"
    return {
        "id": c.id,
        "title": c.title,
        "slug": c.slug,
        "cover_url": c.cover_url,
        "description": c.description,
        "difficulty": c.difficulty,
        "estimated_time": c.estimated_time,
        "price": float(c.price or 0),
        "is_free": bool(c.is_free),
        "is_published": bool(c.is_published),
        "creator_id": c.creator_id,
        "view_count": int(c.view_count or 0),
        "sales_count": int(c.sales_count or 0),
        "created_at": str(c.created_at),
        "updated_at": str(c.updated_at),
        "creator": {
            "id": creator.id,
            "username": creator.username,
            "nickname": creator.nickname,
            "avatar_url": getattr(creator, "avatar_url", None),
            "avatar_color": getattr(creator, "avatar_color", None),
            "role": role,
        } if creator else None,
    }


class CaseCreate(BaseModel):
    title: str
    slug: str
    creator_id: str
    cover_url: str | None = None
    description: str | None = None
    difficulty: str | None = None
    estimated_time: str | None = None
    price: float = 0
    is_free: bool = True
    is_published: bool = False


class CaseUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    creator_id: str | None = None
    cover_url: str | None = None
    description: str | None = None
    difficulty: str | None = None
    estimated_time: str | None = None
    price: float | None = None
    is_free: bool | None = None
    is_published: bool | None = None


@router.get("/cases")
async def admin_list_cases(
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：案例列表（含未发布）"""
    result = await db.execute(
        select(Case).options(joinedload(Case.creator)).order_by(Case.created_at.desc())
    )
    cases = result.unique().scalars().all()
    return [_case_dict(c) for c in cases]


@router.get("/cases/{case_id}")
async def admin_get_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：单个案例（编辑用）"""
    result = await db.execute(
        select(Case).options(joinedload(Case.creator)).where(Case.id == case_id)
    )
    case = result.unique().scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="案例未找到")
    return _case_dict(case)


@router.post("/cases")
async def admin_create_case(
    body: CaseCreate,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：新建案例"""
    from app.models.case import Case as CaseModel
    case = CaseModel(
        title=body.title,
        slug=body.slug,
        creator_id=body.creator_id,
        cover_url=body.cover_url,
        description=body.description,
        difficulty=body.difficulty,
        estimated_time=body.estimated_time,
        price=body.price,
        is_free=body.is_free,
        is_published=body.is_published,
    )
    db.add(case)
    await db.flush()
    await db.refresh(case)
    return _case_dict(case)


@router.put("/cases/{case_id}")
async def admin_update_case(
    case_id: str,
    body: CaseUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：更新案例"""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="案例未找到")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(case, k, v)
    await db.flush()
    await db.refresh(case)
    result2 = await db.execute(select(Case).options(joinedload(Case.creator)).where(Case.id == case_id))
    case = result2.unique().scalar_one_or_none()
    return _case_dict(case)


ALLOWED_EXT = (".jpg", ".jpeg", ".png", ".gif", ".webp")


@router.post("/upload/cover")
async def admin_upload_cover(
    file: UploadFile = File(...),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：上传封面图，返回可用的 cover_url（相对路径）。"""
    if not file.filename or not file.filename.strip():
        raise HTTPException(status_code=400, detail="请选择文件")
    ext = Path(file.filename).suffix or ".jpg"
    if ext.lower() not in ALLOWED_EXT:
        ext = ".jpg"
    dest_dir = UPLOAD_PATH / "cases"
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = dest_dir / filename
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="文件为空")
    dest.write_bytes(content)
    return {"url": f"/uploads/cases/{filename}"}
