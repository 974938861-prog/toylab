from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

from app.config import ASYNC_DB_URL, SYNC_DB_URL

# 异步：自定义 index 统计等
engine = create_async_engine(ASYNC_DB_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# 同步：供 SQLAdmin 使用，避免异步导致的 500
sync_engine = create_engine(SYNC_DB_URL, echo=False)
sync_session_maker = sessionmaker(bind=sync_engine, class_=Session, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db():
    pass
