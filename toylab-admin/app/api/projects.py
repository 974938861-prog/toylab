from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectFile, ProjectModule
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectOut,
    ProjectFileUpdate, ProjectFileOut,
    ProjectModuleCreate, ProjectModuleOut,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["项目"])


@router.get("/", response_model=list[ProjectOut])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.user_id == current_user.id)
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(user_id=current_user.id, **body.model_dump())
    db.add(project)
    await db.flush()
    for ft in ("blocks", "workflow", "python"):
        db.add(ProjectFile(project_id=project.id, file_type=ft))
    await db.flush()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_user_project(project_id, current_user.id, db)
    return project


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    body: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_user_project(project_id, current_user.id, db)
    for key, val in body.model_dump(exclude_none=True).items():
        setattr(project, key, val)
    await db.flush()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_user_project(project_id, current_user.id, db)
    await db.delete(project)


@router.get("/{project_id}/files", response_model=list[ProjectFileOut])
async def get_project_files(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_user_project(project_id, current_user.id, db)
    result = await db.execute(
        select(ProjectFile).where(ProjectFile.project_id == project_id)
    )
    return result.scalars().all()


@router.put("/{project_id}/files/{file_type}", response_model=ProjectFileOut)
async def save_project_file(
    project_id: str,
    file_type: str,
    body: ProjectFileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_user_project(project_id, current_user.id, db)
    result = await db.execute(
        select(ProjectFile).where(
            ProjectFile.project_id == project_id,
            ProjectFile.file_type == file_type,
        )
    )
    pf = result.scalar_one_or_none()
    if not pf:
        pf = ProjectFile(project_id=project_id, file_type=file_type)
        db.add(pf)
    if body.content is not None:
        pf.content = body.content
    if body.code_text is not None:
        pf.code_text = body.code_text
    pf.version += 1
    await db.flush()
    await db.refresh(pf)
    return pf


@router.get("/{project_id}/modules", response_model=list[ProjectModuleOut])
async def get_project_modules(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_user_project(project_id, current_user.id, db)
    result = await db.execute(
        select(ProjectModule).where(ProjectModule.project_id == project_id)
    )
    return result.scalars().all()


@router.post("/{project_id}/modules", response_model=ProjectModuleOut, status_code=201)
async def add_project_module(
    project_id: str,
    body: ProjectModuleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_user_project(project_id, current_user.id, db)
    mod = ProjectModule(project_id=project_id, **body.model_dump())
    db.add(mod)
    await db.flush()
    await db.refresh(mod)
    return mod


async def _get_user_project(
    project_id: str, user_id: str, db: AsyncSession
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project
