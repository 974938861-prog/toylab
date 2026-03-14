import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.case import Case, CaseBomItem, CaseStep, CaseResource, CaseDevLog
from app.models.community import Comment
from app.models.user import User

router = APIRouter(prefix="/api/cases", tags=["案例"])
logger = logging.getLogger(__name__)

CASE_PLACEHOLDER_IMG = "https://placehold.co/400x225/7C3AED/white?text=Case"

# 与 admin 一致：公开接口返回的 slug 需展开 lg/ins，便于发现页 includes("lamp") 等匹配
_SLUG_EXPAND = {"lg": "lamp", "ins": "instrument"}


def _slug_for_display(slug: str | None) -> str:
    if not slug or "|" not in slug:
        return slug or ""
    try:
        prefix, rest = slug.split("|", 1)
        for code, name in _SLUG_EXPAND.items():
            rest = rest.replace(code, name)
        return f"{prefix}|{rest}"
    except Exception:
        return slug or ""


def _safe_role(creator) -> str:
    if not creator:
        return "user"
    try:
        r = getattr(creator, "role", None)
        if r is None:
            return "user"
        return getattr(r, "value", r) if hasattr(r, "value") else str(r)
    except Exception:
        return "user"


def _case_dict(c: Case) -> dict:
    creator = getattr(c, "creator", None)
    role = _safe_role(creator)
    slug_display = _slug_for_display(getattr(c, "slug", None) or "")
    try:
        price_val = float(c.price if c.price is not None else 0)
    except (TypeError, ValueError):
        price_val = 0.0
    creator_payload = None
    if creator:
        try:
            creator_payload = {
                "id": getattr(creator, "id", ""),
                "username": getattr(creator, "username", "") or "",
                "nickname": getattr(creator, "nickname", None),
                "avatar_url": getattr(creator, "avatar_url", None),
                "avatar_color": getattr(creator, "avatar_color", None),
                "role": role,
            }
        except Exception:
            creator_payload = {"id": getattr(c, "creator_id", ""), "username": "", "nickname": None, "avatar_url": None, "avatar_color": None, "role": "user"}
    return {
        "id": getattr(c, "id", ""),
        "title": getattr(c, "title", "") or "",
        "slug": slug_display,
        "cover_url": getattr(c, "cover_url", None) or CASE_PLACEHOLDER_IMG,
        "description": getattr(c, "description", None),
        "difficulty": getattr(c, "difficulty", None),
        "estimated_time": getattr(c, "estimated_time", None),
        "price": price_val,
        "is_free": bool(getattr(c, "is_free", True)),
        "is_published": bool(getattr(c, "is_published", False)),
        "creator_id": getattr(c, "creator_id", "") or "",
        "creator_display_name": getattr(c, "creator_display_name", None),
        "view_count": int(getattr(c, "view_count", 0) or 0),
        "sales_count": int(getattr(c, "sales_count", 0) or 0),
        "created_at": str(getattr(c, "created_at", "")),
        "updated_at": str(getattr(c, "updated_at", "")),
        "designer_story": getattr(c, "designer_story", None),
        "demo_video_url": getattr(c, "demo_video_url", None),
        "cover_video_url": getattr(c, "cover_video_url", None),
        "creator": creator_payload,
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


def _bom_dict(b):
    return {
        "id": b.id, "case_id": b.case_id, "item_type": b.item_type,
        "name": b.name, "spec": b.spec, "unit_price": float(b.unit_price or 0),
        "required_qty": b.required_qty, "doc_url": b.doc_url,
        "model_url": getattr(b, "model_url", None),
        "sort_order": b.sort_order,
    }


def _step_dict(s):
    return {
        "id": s.id, "case_id": s.case_id, "step_number": s.step_number,
        "title": s.title, "description": s.description,
        "image_url": s.image_url, "video_url": s.video_url,
        "duration_minutes": s.duration_minutes,
    }


def _res_dict(r):
    return {
        "id": r.id, "case_id": r.case_id, "resource_type": r.resource_type,
        "name": r.name, "file_url": r.file_url, "file_size": r.file_size,
        "description": r.description,
    }


def _log_dict(l):
    return {
        "id": l.id, "case_id": l.case_id, "title": l.title,
        "content": l.content, "log_date": str(l.log_date), "sort_order": l.sort_order,
    }


@router.get("/{case_id}")
async def get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(Case).options(joinedload(Case.creator)).where(Case.id == case_id)
        )
        case = result.unique().scalar_one_or_none()
        if not case:
            raise HTTPException(status_code=404, detail="案例未找到")

        # 必须在任何后续 await db.execute 之前构建 case 的字典，否则 session 会过期 case，
        # 再访问 case.updated_at 等会触发异步刷新，在同步的 _case_dict 里导致 MissingGreenlet
        case_payload = _case_dict(case)

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

        bom_list = [_bom_dict(b) for b in bom.scalars().all()]
        steps_list = [_step_dict(s) for s in steps.scalars().all()]
        resources_list = [_res_dict(r) for r in resources.scalars().all()]
        dev_logs_list = [_log_dict(l) for l in dev_logs.scalars().all()]

        try:
            await db.execute(update(Case).where(Case.id == case_id).values(view_count=Case.view_count + 1))
        except Exception:
            pass

        return {
            "case": case_payload,
            "bomItems": bom_list,
            "steps": steps_list,
            "resources": resources_list,
            "devLogs": dev_logs_list,
            "comments": comments_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("get_case %s failed", case_id)
        raise HTTPException(status_code=500, detail=f"案例加载失败：{str(e)}")
