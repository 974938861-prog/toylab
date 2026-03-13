from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.project import Project
from app.models.user_part import UserPart
from app.auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["项目"])


class ProjectCreate(BaseModel):
    name: str


class ProjectDelete(BaseModel):
    id: str


@router.get("")
async def list_projects(
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    projects_result = await db.execute(
        select(Project).where(Project.user_id == current["id"]).order_by(Project.updated_at.desc())
    )

    parts_result = await db.execute(
        select(UserPart).options(joinedload(UserPart.product)).where(UserPart.user_id == current["id"])
    )

    projects = [
        {"id": p.id, "user_id": p.user_id, "name": p.name, "description": p.description,
         "cover_url": p.cover_url, "is_public": bool(p.is_public),
         "created_at": str(p.created_at), "updated_at": str(p.updated_at)}
        for p in projects_result.scalars().all()
    ]

    user_parts = []
    for pt in parts_result.unique().scalars().all():
        prod = pt.product
        user_parts.append({
            "id": pt.id, "user_id": pt.user_id, "product_id": pt.product_id,
            "quantity": pt.quantity, "last_used_project": pt.last_used_project,
            "firmware_version": pt.firmware_version, "added_at": str(pt.added_at),
            "product": {
                "id": prod.id, "name": prod.name, "spec": prod.spec,
                "price": float(prod.price or 0), "category_id": prod.category_id,
                "cover_url": prod.cover_url,
            } if prod else None,
        })

    return {"projects": projects, "userParts": user_parts}


@router.post("")
async def create_project(
    body: ProjectCreate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(user_id=current["id"], name=body.name)
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return {
        "id": project.id, "user_id": project.user_id, "name": project.name,
        "description": project.description, "cover_url": project.cover_url,
        "is_public": bool(project.is_public),
        "created_at": str(project.created_at), "updated_at": str(project.updated_at),
    }


@router.delete("")
async def delete_project(
    body: ProjectDelete,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(Project).where(Project.id == body.id, Project.user_id == current["id"])
    )
    return {"ok": True}
