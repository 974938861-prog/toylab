from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.community import Comment
from app.models.user import User
from app.auth import get_current_user

router = APIRouter(prefix="/api/comments", tags=["评论"])


class CommentBody(BaseModel):
    target_type: str
    target_id: str
    content: str


@router.post("")
async def add_comment(
    body: CommentBody,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comment = Comment(
        user_id=current["id"],
        target_type=body.target_type,
        target_id=body.target_id,
        content=body.content,
    )
    db.add(comment)
    await db.flush()
    await db.refresh(comment)

    user_result = await db.execute(select(User).where(User.id == current["id"]))
    u = user_result.scalar_one()

    return {
        "id": comment.id, "user_id": comment.user_id,
        "target_type": comment.target_type, "target_id": comment.target_id,
        "content": comment.content, "created_at": str(comment.created_at),
        "user": {"id": u.id, "username": u.username, "nickname": u.nickname,
                 "avatar_url": u.avatar_url, "avatar_color": u.avatar_color},
    }
