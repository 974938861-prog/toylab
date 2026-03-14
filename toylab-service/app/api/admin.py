"""管理端 API：业务统一放在 service，管理端前端只调这些接口。"""
import logging
import uuid
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import UPLOAD_PATH
from app.database import get_db
from app.models.case import Case, CaseBomItem, CaseStep, CaseResource, CaseDevLog
from app.models.product import Product, ProductCategory
from app.models.user import User
from app.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["管理端"])


# 分类存入 DB 时加前缀，避免与 MySQL 保留字冲突
_SLUG_CAT_PREFIX = "cat_"
# 灯具、乐器用代码存储，避免 MySQL 保留字 INSTRUMENT 等导致 500
_SLUG_SAFE_ENCODE = {"lamp": "lg", "instrument": "ins"}
_SLUG_SAFE_DECODE = {v: k for k, v in _SLUG_SAFE_ENCODE.items()}


def _slug_for_admin(c: Case) -> str:
    """返回给管理端编辑用的 slug（去掉 case_id 前缀，还原 lg/ins 与 cat_ 代码）。"""
    if not c.slug or "|" not in c.slug:
        return c.slug or ""
    raw = c.slug.split("|", 1)[-1].strip()
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    decoded = []
    for p in parts:
        if p in _SLUG_SAFE_DECODE:
            decoded.append(_SLUG_SAFE_DECODE[p])
        elif p.startswith(_SLUG_CAT_PREFIX):
            decoded.append(p[len(_SLUG_CAT_PREFIX) :])
        else:
            decoded.append(p)
    return ",".join(decoded)


def _case_dict(c: Case, creator: User | None = None) -> dict:
    if creator is None and c.creator:
        creator = c.creator
    role = getattr(creator.role, "value", creator.role) if creator and getattr(creator, "role", None) else "user"
    return {
        "id": c.id,
        "title": c.title,
        "slug": _slug_for_admin(c),
        "cover_url": c.cover_url,
        "description": c.description,
        "difficulty": c.difficulty,
        "estimated_time": c.estimated_time,
        "price": float(c.price or 0),
        "is_free": bool(c.is_free),
        "is_published": bool(c.is_published),
        "creator_id": c.creator_id,
        "creator_display_name": getattr(c, "creator_display_name", None),
        "view_count": int(c.view_count or 0),
        "sales_count": int(c.sales_count or 0),
        "created_at": str(c.created_at),
        "updated_at": str(c.updated_at),
        "designer_story": getattr(c, "designer_story", None),
        "demo_video_url": getattr(c, "demo_video_url", None),
        "preview_3d_url": getattr(c, "preview_3d_url", None),
        "cover_video_url": getattr(c, "cover_video_url", None),
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
    slug: str = ""
    creator_id: str = ""
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
    creator_display_name: str | None = None
    cover_url: str | None = None
    description: str | None = None
    difficulty: str | None = None
    estimated_time: str | None = None
    price: float | None = None
    is_free: bool | None = None
    is_published: bool | None = None
    designer_story: str | None = None
    demo_video_url: str | None = None
    preview_3d_url: str | None = None
    cover_video_url: str | None = None
    bom_items: list[dict] | None = None
    resources: list[dict] | None = None
    steps: list[dict] | None = None


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


def _bom_row(b: CaseBomItem) -> dict:
    return {
        "id": b.id,
        "case_id": b.case_id,
        "item_type": b.item_type,
        "name": b.name,
        "spec": b.spec,
        "unit_price": float(b.unit_price or 0),
        "required_qty": b.required_qty,
        "doc_url": b.doc_url,
        "model_url": getattr(b, "model_url", None),
        "sort_order": b.sort_order,
    }


def _step_row(s: CaseStep) -> dict:
    return {
        "id": s.id,
        "case_id": s.case_id,
        "step_number": s.step_number,
        "title": s.title,
        "description": s.description,
        "image_url": s.image_url,
        "video_url": s.video_url,
        "duration_minutes": s.duration_minutes,
    }


def _resource_row(r: CaseResource) -> dict:
    return {
        "id": r.id,
        "case_id": r.case_id,
        "resource_type": r.resource_type,
        "name": r.name,
        "file_url": r.file_url,
        "description": r.description,
        "sort_order": r.sort_order,
    }


def _dev_log_row(d: CaseDevLog) -> dict:
    return {
        "id": d.id,
        "case_id": d.case_id,
        "title": d.title,
        "content": d.content,
        "log_date": str(d.log_date),
        "sort_order": d.sort_order,
    }


@router.get("/cases/{case_id}")
async def admin_get_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：单个案例（编辑用，含 BOM、步骤、资源）"""
    result = await db.execute(
        select(Case).options(joinedload(Case.creator)).where(Case.id == case_id)
    )
    case = result.unique().scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="案例未找到")
    out = _case_dict(case)
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
    out["bom_items"] = [_bom_row(b) for b in bom.scalars().all()]
    out["steps"] = [_step_row(s) for s in steps.scalars().all()]
    out["resources"] = [_resource_row(r) for r in resources.scalars().all()]
    out["dev_logs"] = [_dev_log_row(d) for d in dev_logs.scalars().all()]
    return out


@router.post("/cases")
async def admin_create_case(
    body: CaseCreate,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：新建案例。creator_id 为空时自动使用当前登录管理员的 ID。"""
    from app.models.case import Case as CaseModel
    creator_id = (body.creator_id or "").strip() or _admin.get("sub") or _admin.get("id") or ""
    if not creator_id:
        raise HTTPException(status_code=400, detail="无法获取创作者 ID，请重新登录")
    case = CaseModel(
        title=body.title,
        slug=body.slug or "",
        creator_id=creator_id,
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
    # 用 case_id|分类码 存储，lamp/instrument 用 lg/ins 避免 MySQL 保留字
    raw = (body.slug or "").strip()
    if "|" in raw:
        raw = raw.split("|", 1)[-1].strip()
    if raw:
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        encoded = []
        for p in parts:
            encoded.append(_SLUG_SAFE_ENCODE.get(p, _SLUG_CAT_PREFIX + p))
        raw = ",".join(encoded)
    case.slug = f"{case.id}|{raw}" if raw else case.id
    await db.flush()
    result2 = await db.execute(
        select(Case).options(joinedload(Case.creator)).where(Case.id == case.id)
    )
    case = result2.unique().scalar_one_or_none() or case
    return _case_dict(case)


@router.delete("/cases/{case_id}")
async def admin_delete_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：删除案例（同时删除关联的 BOM、步骤、资源、开发日志）"""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="案例未找到")
    await db.delete(case)
    await db.flush()
    return {"ok": True}


@router.put("/cases/{case_id}/steps")
async def admin_replace_case_steps(
    case_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """仅保存制作步骤：先删后增，保证增减生效。须放在 /cases/{case_id} 之前以免被误匹配。"""
    result = await db.execute(select(Case).where(Case.id == case_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="案例未找到")
    body = await request.json()
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="请求体须为 JSON 对象")
    raw = body.get("steps")
    if not isinstance(raw, list):
        raw = []
    to_insert = []
    for idx, row in enumerate(raw):
        if not isinstance(row, dict):
            continue
        title = (row.get("title") or "").strip() or f"步骤 {idx + 1}"
        _d, _i, _v = row.get("description"), row.get("image_url"), row.get("video_url")
        desc = (_d.strip() if isinstance(_d, str) and _d.strip() else None) if _d is not None else None
        img = (_i.strip() if isinstance(_i, str) and _i.strip() else None) if _i is not None else None
        vid = (_v.strip() if isinstance(_v, str) and _v.strip() else None) if _v is not None else None
        to_insert.append((idx, title, desc, img, vid))
    existing = (await db.execute(select(CaseStep).where(CaseStep.case_id == case_id))).scalars().all()
    for s in existing:
        await db.delete(s)
    await db.flush()
    for idx, title, desc, img, vid in to_insert:
        s = CaseStep(
            id=str(uuid.uuid4()),
            case_id=case_id,
            step_number=idx,
            title=title,
            description=desc,
            image_url=img,
            video_url=vid,
        )
        db.add(s)
    await db.flush()
    steps = (await db.execute(select(CaseStep).where(CaseStep.case_id == case_id).order_by(CaseStep.step_number))).scalars().all()
    logging.info("admin_replace_case_steps case_id=%s count=%s", case_id, len(steps))
    return {"steps": [_step_row(s) for s in steps]}


@router.put("/cases/{case_id}/dev_logs")
async def admin_replace_case_dev_logs(
    case_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """仅保存开发日志：先删后增，保证新增/修改的迭代版本内容能保存。须放在 /cases/{case_id} 之前以免被误匹配。"""
    result = await db.execute(select(Case).where(Case.id == case_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="案例未找到")
    body = await request.json()
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="请求体须为 JSON 对象")
    raw = body.get("dev_logs")
    if not isinstance(raw, list):
        raw = []

    def _parse_log_date(v):
        if v is None:
            return date.today()
        if isinstance(v, date):
            return v
        s = (v or "").strip()
        if not s:
            return date.today()
        try:
            return date.fromisoformat(s[:10])
        except (ValueError, TypeError):
            return date.today()

    to_insert = []
    for idx, row in enumerate(raw):
        if not isinstance(row, dict):
            continue
        raw_title = (row.get("title") or "").strip()
        title = raw_title if raw_title else f"v0.{idx + 1}"
        content = (row.get("content") or "").strip() or None
        log_date = _parse_log_date(row.get("log_date"))
        to_insert.append((idx, title, content, log_date))

    existing = (await db.execute(select(CaseDevLog).where(CaseDevLog.case_id == case_id))).scalars().all()
    for d in existing:
        await db.delete(d)
    await db.flush()
    for idx, title, content, log_date in to_insert:
        d = CaseDevLog(
            id=str(uuid.uuid4()),
            case_id=case_id,
            title=title,
            content=content,
            log_date=log_date,
            sort_order=idx,
        )
        db.add(d)
    await db.flush()
    dev_logs = (
        await db.execute(
            select(CaseDevLog).where(CaseDevLog.case_id == case_id).order_by(CaseDevLog.sort_order)
        )
    ).scalars().all()
    logging.info("admin_replace_case_dev_logs case_id=%s count=%s", case_id, len(dev_logs))
    return {"dev_logs": [_dev_log_row(x) for x in dev_logs]}


@router.put("/cases/{case_id}")
async def admin_update_case(
    case_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：更新案例"""
    try:
        body_json = await request.json()
        if not isinstance(body_json, dict):
            raise HTTPException(status_code=400, detail="请求体须为 JSON 对象")
        bom_items_payload = body_json.get("bom_items")
        resources_payload = body_json.get("resources")
        steps_raw = body_json.get("steps")
        dev_logs_raw = body_json.get("dev_logs")
        if not isinstance(bom_items_payload, list):
            bom_items_payload = None
        if not isinstance(resources_payload, list):
            resources_payload = None
        if "steps" in body_json:
            if isinstance(steps_raw, list):
                steps_payload = steps_raw
            elif isinstance(steps_raw, dict):
                steps_payload = [v for v in steps_raw.values() if isinstance(v, dict)]
            else:
                steps_payload = []
        else:
            steps_payload = None
        if "dev_logs" in body_json:
            dev_logs_payload = dev_logs_raw if isinstance(dev_logs_raw, list) else []
        else:
            dev_logs_payload = None
        logging.info(
            "admin_update_case body keys=%s steps_in_body=%s steps_payload_len=%s dev_logs_len=%s",
            list(body_json.keys()),
            "steps" in body_json,
            len(steps_payload) if steps_payload is not None else "n/a",
            len(dev_logs_payload) if dev_logs_payload is not None else "n/a",
        )
        base = {k: v for k, v in body_json.items() if k not in ("bom_items", "resources", "steps", "dev_logs")}
        try:
            body = CaseUpdate.model_validate(base)
        except Exception as e:
            raise HTTPException(status_code=400, detail="请求体校验失败：" + str(e)) from e
        result = await db.execute(select(Case).where(Case.id == case_id))
        case = result.scalar_one_or_none()
        if not case:
            raise HTTPException(status_code=404, detail="案例未找到")
        data = body.model_dump(exclude_unset=True)
        if "slug" in data:
            raw = (data["slug"] or "").strip()
            if isinstance(raw, str) and "|" in raw:
                raw = raw.split("|", 1)[-1].strip()
            raw = str(raw).strip() if raw is not None else ""
            if raw:
                parts = [p.strip() for p in raw.split(",") if p.strip()]
                encoded = []
                for p in parts:
                    encoded.append(_SLUG_SAFE_ENCODE.get(p, _SLUG_CAT_PREFIX + p))
                raw = ",".join(encoded)
            data["slug"] = f"{case_id}|{raw}" if raw else case_id
            if len(data["slug"]) > 200:
                data["slug"] = data["slug"][:200]
        for k, v in data.items():
            if k == "creator_id" and (v is None or (isinstance(v, str) and not v.strip())):
                continue
            if k == "title" and (v is None or (isinstance(v, str) and not v.strip())):
                continue
            if k in ("bom_items", "resources", "steps", "dev_logs"):
                continue
            setattr(case, k, v)
        # 显式写入创作者展示名，确保请求体里的值一定落库（避免 exclude_unset 等导致未更新）
        if "creator_display_name" in data:
            case.creator_display_name = data["creator_display_name"] if data["creator_display_name"] else None
        if "cover_video_url" in body_json:
            raw = body_json.get("cover_video_url")
            case.cover_video_url = (raw.strip() if isinstance(raw, str) and raw.strip() else None) or None
        try:
            await db.flush()
        except IntegrityError as e:
            if "unique" in str(e).lower() or "duplicate" in str(e).lower():
                raise HTTPException(
                    status_code=400,
                    detail="标识符保存失败，请换选其他分类或稍后重试",
                ) from e
            raise
        if bom_items_payload is not None:
            _allowed = ("material", "electronic", "mechanical", "device")
            kept_ids = set()
            for idx, row in enumerate(bom_items_payload):
                row = row if isinstance(row, dict) else {}
                bid = row.get("id") if isinstance(row.get("id"), str) and len(str(row.get("id")).strip()) > 0 else None
                raw_type = (row.get("item_type") or "").strip().lower()
                item_type = raw_type if raw_type in _allowed else "material"
                name = (row.get("name") or "").strip() or "未命名"
                required_qty = int(row.get("required_qty", 1)) if row.get("required_qty") is not None else 1
                spec = row.get("spec") if row.get("spec") is not None else None
                doc_url = row.get("doc_url") if row.get("doc_url") is not None else None
                model_url = row.get("model_url") if row.get("model_url") is not None else None
                if bid:
                    res = await db.execute(select(CaseBomItem).where(CaseBomItem.id == bid, CaseBomItem.case_id == case_id))
                    b = res.scalar_one_or_none()
                    if b:
                        b.item_type = item_type
                        b.name = name
                        b.required_qty = max(0, required_qty)
                        b.spec = spec
                        b.doc_url = doc_url
                        b.model_url = model_url
                        b.sort_order = idx
                        kept_ids.add(b.id)
                        await db.flush()
                        continue
                b = CaseBomItem(
                    case_id=case_id,
                    item_type=item_type,
                    name=name,
                    required_qty=max(0, required_qty),
                    spec=spec,
                    doc_url=doc_url,
                    model_url=model_url,
                    sort_order=idx,
                )
                db.add(b)
                await db.flush()
                kept_ids.add(b.id)
            if kept_ids:
                to_del = (await db.execute(select(CaseBomItem).where(CaseBomItem.case_id == case_id, ~CaseBomItem.id.in_(kept_ids)))).scalars().all()
            else:
                to_del = (await db.execute(select(CaseBomItem).where(CaseBomItem.case_id == case_id))).scalars().all()
            for b in to_del:
                await db.delete(b)
            await db.flush()
        if resources_payload is not None:
            kept_rids = set()
            for idx, row in enumerate(resources_payload):
                row = row if isinstance(row, dict) else {}
                rid = row.get("id") if isinstance(row.get("id"), str) and len(str(row.get("id")).strip()) > 0 else None
                name = (row.get("name") or "").strip() or "未命名"
                description = row.get("description") if row.get("description") is not None else None
                file_url = row.get("file_url") if row.get("file_url") is not None else None
                if rid:
                    res = await db.execute(select(CaseResource).where(CaseResource.id == rid, CaseResource.case_id == case_id))
                    r = res.scalar_one_or_none()
                    if r:
                        r.name = name
                        r.description = description
                        r.file_url = file_url
                        r.sort_order = idx
                        kept_rids.add(r.id)
                        await db.flush()
                        continue
                r = CaseResource(
                    case_id=case_id,
                    resource_type="file",
                    name=name,
                    description=description,
                    file_url=file_url,
                    sort_order=idx,
                )
                db.add(r)
                await db.flush()
                kept_rids.add(r.id)
            if kept_rids:
                to_del_r = (await db.execute(select(CaseResource).where(CaseResource.case_id == case_id, ~CaseResource.id.in_(kept_rids)))).scalars().all()
            else:
                to_del_r = (await db.execute(select(CaseResource).where(CaseResource.case_id == case_id))).scalars().all()
            for r in to_del_r:
                await db.delete(r)
            await db.flush()
        if steps_payload is not None:
            try:
                kept_sids = set()
                for idx, row in enumerate(steps_payload):
                    row = row if isinstance(row, dict) else {}
                    _sid = row.get("id")
                    sid_raw = str(_sid).strip() if _sid is not None and str(_sid).strip() else None
                    is_new_step = sid_raw is None or (isinstance(sid_raw, str) and sid_raw.startswith("new-"))
                    title = (row.get("title") or "").strip() or f"步骤 {idx + 1}"
                    _desc, _img, _vid = row.get("description"), row.get("image_url"), row.get("video_url")
                    description = (_desc.strip() if isinstance(_desc, str) and _desc.strip() else None) if _desc is not None else None
                    image_url = (_img.strip() if isinstance(_img, str) and _img.strip() else None) if _img is not None else None
                    video_url = (_vid.strip() if isinstance(_vid, str) and _vid.strip() else None) if _vid is not None else None
                    if not is_new_step and sid_raw:
                        res = await db.execute(select(CaseStep).where(CaseStep.id == sid_raw, CaseStep.case_id == case_id))
                        s = res.scalar_one_or_none()
                        if s:
                            s.step_number = idx
                            s.title = title
                            s.description = description
                            s.image_url = image_url
                            s.video_url = video_url
                            kept_sids.add(s.id)
                            await db.flush()
                            continue
                    new_id = str(uuid.uuid4())
                    s = CaseStep(
                        id=new_id,
                        case_id=case_id,
                        step_number=idx,
                        title=title,
                        description=description,
                        image_url=image_url,
                        video_url=video_url,
                    )
                    db.add(s)
                    await db.flush()
                    kept_sids.add(new_id)
                valid_sids = {x for x in kept_sids if x}
                if valid_sids:
                    to_del_s = (await db.execute(select(CaseStep).where(CaseStep.case_id == case_id, ~CaseStep.id.in_(valid_sids)))).scalars().all()
                else:
                    to_del_s = (await db.execute(select(CaseStep).where(CaseStep.case_id == case_id))).scalars().all()
                for s in to_del_s:
                    await db.delete(s)
                await db.flush()
            except HTTPException:
                raise
            except Exception as e:
                logging.exception("steps_payload 处理失败: %s", e)
                raise HTTPException(status_code=400, detail="制作步骤保存失败：" + str(e)) from e
            logging.info("admin_update_case steps done, kept_sids count=%s", len(kept_sids))
        if dev_logs_payload is not None:
            try:
                def _parse_log_date(v):
                    if v is None:
                        return date.today()
                    if isinstance(v, date):
                        return v
                    s = (v or "").strip()
                    if not s:
                        return date.today()
                    try:
                        return date.fromisoformat(s[:10])
                    except (ValueError, TypeError):
                        return date.today()

                kept_dids = set()
                for idx, row in enumerate(dev_logs_payload):
                    row = row if isinstance(row, dict) else {}
                    did = row.get("id") if isinstance(row.get("id"), str) and str(row.get("id")).strip() else None
                    is_new = did is None or str(did).strip().startswith("new-")
                    raw_title = (row.get("title") or "").strip()
                    title = raw_title if raw_title else f"v0.{idx + 1}"
                    content = (row.get("content") or "").strip() or None
                    if content is not None and content == "":
                        content = None
                    log_date = _parse_log_date(row.get("log_date"))
                    if not is_new and did:
                        res = await db.execute(
                            select(CaseDevLog).where(CaseDevLog.id == did, CaseDevLog.case_id == case_id)
                        )
                        d = res.scalar_one_or_none()
                        if d:
                            d.title = title
                            d.content = content
                            d.log_date = log_date
                            d.sort_order = idx
                            kept_dids.add(d.id)
                            await db.flush()
                            continue
                    new_id = str(uuid.uuid4())
                    d = CaseDevLog(
                        id=new_id,
                        case_id=case_id,
                        title=title,
                        content=content,
                        log_date=log_date,
                        sort_order=idx,
                    )
                    db.add(d)
                    await db.flush()
                    kept_dids.add(new_id)
                if kept_dids:
                    to_del_d = (
                        await db.execute(
                            select(CaseDevLog).where(
                                CaseDevLog.case_id == case_id, ~CaseDevLog.id.in_(kept_dids)
                            )
                        )
                    ).scalars().all()
                else:
                    to_del_d = (
                        await db.execute(select(CaseDevLog).where(CaseDevLog.case_id == case_id))
                    ).scalars().all()
                for d in to_del_d:
                    await db.delete(d)
                await db.flush()
            except HTTPException:
                raise
            except Exception as e:
                logging.exception("dev_logs_payload 处理失败: %s", e)
                raise HTTPException(status_code=400, detail="开发日志保存失败：" + str(e)) from e
        await db.refresh(case)
        result2 = await db.execute(select(Case).options(joinedload(Case.creator)).where(Case.id == case_id))
        case = result2.unique().scalar_one_or_none()
        out = _case_dict(case)
        bom = await db.execute(select(CaseBomItem).where(CaseBomItem.case_id == case_id).order_by(CaseBomItem.sort_order))
        steps = await db.execute(select(CaseStep).where(CaseStep.case_id == case_id).order_by(CaseStep.step_number))
        resources = await db.execute(select(CaseResource).where(CaseResource.case_id == case_id).order_by(CaseResource.sort_order))
        dev_logs = await db.execute(select(CaseDevLog).where(CaseDevLog.case_id == case_id).order_by(CaseDevLog.sort_order))
        out["bom_items"] = [_bom_row(b) for b in bom.scalars().all()]
        out["steps"] = [_step_row(s) for s in steps.scalars().all()]
        out["resources"] = [_resource_row(r) for r in resources.scalars().all()]
        out["dev_logs"] = [_dev_log_row(d) for d in dev_logs.scalars().all()]
        try:
            await db.commit()
            logging.info("admin_update_case 已提交 case_id=%s out_steps=%s", case_id, len(out.get("steps") or []))
        except Exception as e:
            logging.exception("admin_update_case 提交失败: %s", e)
            raise HTTPException(status_code=500, detail="保存提交失败：" + str(e)) from e
        return out
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("admin_update_case error: %s", e)
        err_msg = str(e).strip() or "未知错误"
        raise HTTPException(
            status_code=500,
            detail=f"保存失败：{err_msg}",
        ) from e


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


ALLOWED_3D_EXT = (".glb", ".gltf", ".obj", ".stl")
ALLOWED_VIDEO_EXT = (".mp4", ".webm", ".mov")


@router.post("/upload/preview-3d")
async def admin_upload_preview_3d(
    file: UploadFile = File(...),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：上传产品 3D 预览文件，返回 URL。"""
    if not file.filename or not file.filename.strip():
        raise HTTPException(status_code=400, detail="请选择文件")
    ext = (Path(file.filename).suffix or "").lower()
    if ext not in ALLOWED_3D_EXT:
        raise HTTPException(status_code=400, detail=f"仅支持: {', '.join(ALLOWED_3D_EXT)}")
    dest_dir = UPLOAD_PATH / "cases" / "preview_3d"
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = dest_dir / filename
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="文件为空")
    dest.write_bytes(content)
    return {"url": f"/uploads/cases/preview_3d/{filename}"}


ALLOWED_COVER_VIDEO_EXT = (".gif", ".mp4", ".webm", ".mov")
MAX_COVER_VIDEO_BYTES = 50 * 1024 * 1024  # 50MB


@router.post("/upload/cover-video")
async def admin_upload_cover_video(
    file: UploadFile = File(...),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：上传封面动态图（GIF/视频），发现页悬停时播放。先读入内存再校验，避免流被消费导致 ERR_CONNECTION_RESET。"""
    try:
        content = await file.read()
    except Exception as e:
        logging.warning("cover-video read error: %s", e)
        raise HTTPException(status_code=400, detail="读取上传文件失败，请重试或换小一点的文件") from e
    if not content:
        raise HTTPException(status_code=400, detail="文件为空")
    if len(content) > MAX_COVER_VIDEO_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"文件过大，封面动态图请不超过 {MAX_COVER_VIDEO_BYTES // (1024*1024)}MB",
        )
    fname = (file.filename or "").strip()
    ext = (Path(fname).suffix or "").lower() if fname else ""
    if ext not in ALLOWED_COVER_VIDEO_EXT:
        ct = (getattr(file, "content_type", None) or "").lower()
        if "image/gif" in ct or (fname and "gif" in fname.lower()):
            ext = ".gif"
        elif "video/mp4" in ct or "video/x-mp4" in ct:
            ext = ".mp4"
        elif "video/webm" in ct:
            ext = ".webm"
        elif "video/quicktime" in ct:
            ext = ".mov"
    if ext not in ALLOWED_COVER_VIDEO_EXT and len(content) >= 6:
        if content[:6] in (b"GIF87a", b"GIF89a"):
            ext = ".gif"
        elif len(content) >= 12 and content[4:12] == b"ftyp":
            ext = ".mp4"
    if ext not in ALLOWED_COVER_VIDEO_EXT:
        raise HTTPException(status_code=400, detail="仅支持 .gif / .mp4 / .webm / .mov，当前文件名或类型无法识别")
    dest_dir = UPLOAD_PATH / "cases" / "cover_video"
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = dest_dir / filename
    dest.write_bytes(content)
    return {"url": f"/uploads/cases/cover_video/{filename}"}


@router.post("/upload/demo-video")
async def admin_upload_demo_video(
    file: UploadFile = File(...),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：上传案例演示视频，返回 URL。"""
    if not file.filename or not file.filename.strip():
        raise HTTPException(status_code=400, detail="请选择文件")
    ext = (Path(file.filename).suffix or "").lower()
    if ext not in ALLOWED_VIDEO_EXT:
        raise HTTPException(status_code=400, detail=f"仅支持: {', '.join(ALLOWED_VIDEO_EXT)}")
    dest_dir = UPLOAD_PATH / "cases" / "demo_video"
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = dest_dir / filename
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="文件为空")
    dest.write_bytes(content)
    return {"url": f"/uploads/cases/demo_video/{filename}"}


@router.post("/upload/product-cover")
async def admin_upload_product_cover(
    file: UploadFile = File(...),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：上传零件封面图，返回可用的 cover_url（相对路径）。"""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="文件为空")
    ext = (Path(file.filename).suffix if file.filename else "").lower() or ".jpg"
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"仅支持: {', '.join(ALLOWED_EXT)}")
    dest_dir = UPLOAD_PATH / "products"
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = dest_dir / filename
    dest.write_bytes(content)
    return {"url": f"/uploads/products/{filename}"}


# ═══════════════════════════════════════════════════════════
# 零件（商品）管理：与 web 零件商城同源数据
# ═══════════════════════════════════════════════════════════

def _product_dict(p: Product, category: ProductCategory | None = None) -> dict:
    cat = category or getattr(p, "category", None)
    return {
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "category_id": p.category_id,
        "category": {"id": cat.id, "name": cat.name, "slug": cat.slug} if cat else None,
        "description": p.description,
        "spec": p.spec,
        "price": float(p.price or 0),
        "cover_url": p.cover_url,
        "model_3d_url": p.model_3d_url,
        "stock_status": getattr(p.stock_status, "value", p.stock_status) if hasattr(p.stock_status, "value") else p.stock_status,
        "is_published": bool(getattr(p, "is_published", False)),
        "sales_count": int(p.sales_count or 0),
        "view_count": int(p.view_count or 0),
        "created_at": str(p.created_at),
        "updated_at": str(p.updated_at),
    }


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    category_id: int | None = None
    description: str | None = None
    spec: str | None = None
    price: float | None = None
    cover_url: str | None = None
    model_3d_url: str | None = None
    stock_status: str | None = None
    is_published: bool | None = None


@router.get("/products")
async def admin_list_products(
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：零件列表（与 web 零件商城同源）"""
    result = await db.execute(
        select(Product).options(joinedload(Product.category)).order_by(Product.created_at.desc())
    )
    products = result.unique().scalars().all()
    return [_product_dict(p) for p in products]


@router.get("/product-categories")
async def admin_list_product_categories(
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：商品分类（用于编辑零件时选择）"""
    result = await db.execute(
        select(ProductCategory).order_by(ProductCategory.sort_order, ProductCategory.id)
    )
    cats = result.scalars().all()
    return [{"id": c.id, "name": c.name, "slug": c.slug, "parent_id": c.parent_id, "sort_order": c.sort_order} for c in cats]


@router.get("/products/{product_id}")
async def admin_get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：单个零件（编辑用）"""
    result = await db.execute(
        select(Product).options(joinedload(Product.category)).where(Product.id == product_id)
    )
    product = result.unique().scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="零件未找到")
    return _product_dict(product)


@router.delete("/products/{product_id}")
async def admin_delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：删除零件"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="零件未找到")
    await db.delete(product)
    await db.flush()
    return {"ok": True}


@router.post("/products")
async def admin_create_product(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：新建零件"""
    body_json = await request.json()
    name = (body_json.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="名称不能为空")
    slug = (body_json.get("slug") or "").strip()
    if not slug:
        slug = f"product-{uuid.uuid4().hex[:8]}"
    result_check = await db.execute(select(Product).where(Product.slug == slug))
    if result_check.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    product = Product(
        name=name,
        slug=slug,
        price=float(body_json.get("price") or 0),
        stock_status="in_stock",
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return _product_dict(product)


@router.put("/products/{product_id}")
async def admin_update_product(
    product_id: str,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """管理端：更新零件（同步到 web 零件商城）"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="零件未找到")
    data = body.model_dump(exclude_unset=True)
    if "stock_status" in data and data["stock_status"] not in ("in_stock", "out_of_stock", "pre_order"):
        data["stock_status"] = "in_stock"
    for k, v in data.items():
        setattr(product, k, v)
    await db.flush()
    await db.refresh(product)
    result2 = await db.execute(select(Product).options(joinedload(Product.category)).where(Product.id == product_id))
    product = result2.unique().scalar_one_or_none()
    return _product_dict(product)
