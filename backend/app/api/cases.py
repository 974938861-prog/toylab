from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.community import Comment
from app.schemas.case import CaseListOut, CaseDetailOut, CaseCreate, CommentCreate, CommentOut
from app.api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/cases", tags=["灵感案例"])


@router.get("/", response_model=list[CaseListOut])
async def list_cases(
    category: str | None = Query(None),
    search: str | None = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Case)
        .options(selectinload(Case.creator))
        .where(Case.is_published == True)
    )
    if category and category != "all":
        query = query.where(Case.category == category)
    if search:
        query = query.where(Case.title.ilike(f"%{search}%"))

    order_map = {
        "newest": Case.created_at.desc(),
        "hottest": Case.view_count.desc(),
        "most_fav": Case.purchase_count.desc(),
    }
    query = query.order_by(order_map.get(sort, Case.created_at.desc()))
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{case_id}", response_model=CaseDetailOut)
async def get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Case)
        .options(
            selectinload(Case.creator),
            selectinload(Case.bom_items),
            selectinload(Case.steps),
            selectinload(Case.resources),
            selectinload(Case.dev_logs),
        )
        .where(Case.id == case_id)
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="案例不存在")
    case.view_count += 1
    await db.flush()
    return case


@router.post("/", response_model=CaseListOut, status_code=201)
async def create_case(
    body: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    case = Case(creator_id=current_user.id, **body.model_dump())
    db.add(case)
    await db.flush()
    await db.refresh(case)
    return case


@router.get("/{case_id}/comments", response_model=list[CommentOut])
async def get_comments(case_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.target_type == "case", Comment.target_id == case_id)
        .order_by(Comment.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{case_id}/comments", response_model=CommentOut, status_code=201)
async def add_comment(
    case_id: str,
    body: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comment = Comment(
        user_id=current_user.id,
        target_type="case",
        target_id=case_id,
        content=body.content,
    )
    db.add(comment)
    await db.flush()
    await db.refresh(comment)
    result = await db.execute(
        select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment.id)
    )
    return result.scalar_one()
