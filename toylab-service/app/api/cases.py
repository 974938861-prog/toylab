from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.case import Case, CaseBomItem, CaseStep, CaseResource, CaseDevLog
from app.models.community import Comment
from app.models.user import User

router = APIRouter(prefix="/api/cases", tags=["案例"])


CASE_PLACEHOLDER_IMG = "https://placehold.co/400x225/7C3AED/white?text=Case"

def _case_dict(c: Case) -> dict:
    creator = c.creator
    role = getattr(creator.role, "value", creator.role) if creator and creator.role else "user"
    return {
        "id": c.id, "title": c.title, "slug": c.slug,
        "cover_url": c.cover_url or CASE_PLACEHOLDER_IMG, "description": c.description,
        "difficulty": c.difficulty, "estimated_time": c.estimated_time,
        "price": float(c.price or 0), "is_free": bool(c.is_free),
        "is_published": bool(c.is_published), "creator_id": c.creator_id,
        "view_count": int(c.view_count or 0), "sales_count": int(c.sales_count or 0),
        "created_at": str(c.created_at), "updated_at": str(c.updated_at),
        "creator": {
            "id": creator.id, "username": creator.username,
            "nickname": creator.nickname, "avatar_url": creator.avatar_url,
            "avatar_color": creator.avatar_color, "role": role,
        } if creator else None,
    }


@router.get("")
async def list_cases(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Case)
        .options(joinedload(Case.creator))
        .where(Case.is_published == True)
        .order_by(Case.created_at.desc())
    )
    cases = result.unique().scalars().all()
    return [_case_dict(c) for c in cases]


@router.get("/{case_id}")
async def get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Case).options(joinedload(Case.creator)).where(Case.id == case_id)
    )
    case = result.unique().scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="案例未找到")

    bom = await db.execute(
        select(CaseBomItem).where(CaseBomItem.case_id == case_id).order_by(CaseBomItem.sort_order)
    )
    steps = await db.execute(
        select(CaseStep).where(CaseStep.case_id == case_id).order_by(CaseStep.step_number)
    )
    resources = await db.execute(
        select(CaseResource).where(CaseResource.case_id == case_id).order_by(CaseResource.sort_order)
    )
    dev_logs = await db.execute(
        select(CaseDevLog).where(CaseDevLog.case_id == case_id).order_by(CaseDevLog.sort_order)
    )
    comments_result = await db.execute(
        select(Comment, User)
        .join(User, Comment.user_id == User.id)
        .where(Comment.target_type == "case", Comment.target_id == case_id)
        .order_by(Comment.created_at.desc())
    )

    comments_data = []
    for c, u in comments_result.all():
        comments_data.append({
            "id": c.id, "user_id": c.user_id, "target_type": c.target_type,
            "target_id": c.target_id, "content": c.content, "created_at": str(c.created_at),
            "user": {"id": u.id, "username": u.username, "nickname": u.nickname,
                     "avatar_url": u.avatar_url, "avatar_color": u.avatar_color},
        })

    await db.execute(update(Case).where(Case.id == case_id).values(view_count=Case.view_count + 1))

    def _bom_dict(b):
        return {"id": b.id, "case_id": b.case_id, "item_type": b.item_type,
                "name": b.name, "spec": b.spec, "unit_price": float(b.unit_price or 0),
                "required_qty": b.required_qty, "doc_url": b.doc_url, "sort_order": b.sort_order}

    def _step_dict(s):
        return {"id": s.id, "case_id": s.case_id, "step_number": s.step_number,
                "title": s.title, "description": s.description,
                "image_url": s.image_url, "video_url": s.video_url,
                "duration_minutes": s.duration_minutes}

    def _res_dict(r):
        return {"id": r.id, "case_id": r.case_id, "resource_type": r.resource_type,
                "name": r.name, "file_url": r.file_url, "file_size": r.file_size,
                "description": r.description}

    def _log_dict(l):
        return {"id": l.id, "case_id": l.case_id, "title": l.title,
                "content": l.content, "log_date": str(l.log_date), "sort_order": l.sort_order}

    return {
        "case": _case_dict(case),
        "bomItems": [_bom_dict(b) for b in bom.scalars().all()],
        "steps": [_step_dict(s) for s in steps.scalars().all()],
        "resources": [_res_dict(r) for r in resources.scalars().all()],
        "devLogs": [_log_dict(l) for l in dev_logs.scalars().all()],
        "comments": comments_data,
    }
