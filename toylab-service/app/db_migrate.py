"""启动时自动补全案例表缺失列（creator_display_name 等），与 migrate_case_detail_fields.py 一致。"""
import logging

logger = logging.getLogger(__name__)


def _is_sqlite(database_url: str) -> bool:
    return "sqlite" in (database_url or "").lower()


async def ensure_case_columns_async(database_url: str) -> None:
    """若 cases_ / case_bom_items 缺少列则执行 ALTER TABLE，忽略已存在。使用异步引擎，与 app 一致。"""
    if not database_url:
        return
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
    except ImportError:
        return
    is_sqlite = _is_sqlite(database_url)
    try:
        engine = create_async_engine(database_url)
    except Exception as e:
        logger.warning("db_migrate: create_async_engine failed: %s", e)
        return
    cases_cols = [
        ("designer_story", "ALTER TABLE cases_ ADD COLUMN designer_story TEXT"),
        ("demo_video_url", "ALTER TABLE cases_ ADD COLUMN demo_video_url VARCHAR(500)" if not is_sqlite else "ALTER TABLE cases_ ADD COLUMN demo_video_url TEXT"),
        ("preview_3d_url", "ALTER TABLE cases_ ADD COLUMN preview_3d_url VARCHAR(500)" if not is_sqlite else "ALTER TABLE cases_ ADD COLUMN preview_3d_url TEXT"),
        ("creator_display_name", "ALTER TABLE cases_ ADD COLUMN creator_display_name VARCHAR(200)" if not is_sqlite else "ALTER TABLE cases_ ADD COLUMN creator_display_name TEXT"),
        ("cover_video_url", "ALTER TABLE cases_ ADD COLUMN cover_video_url VARCHAR(500)" if not is_sqlite else "ALTER TABLE cases_ ADD COLUMN cover_video_url TEXT"),
    ]
    async with engine.begin() as conn:
        for name, stmt in cases_cols:
            try:
                await conn.execute(text(stmt))
                logger.info("db_migrate: added column %s", name)
            except Exception as e:
                err = str(e).lower()
                if "duplicate" in err or "already exists" in err or "duplicate column" in err:
                    pass
                else:
                    logger.warning("db_migrate: %s %s", name, e)
        stmt_bom = "ALTER TABLE case_bom_items ADD COLUMN model_url VARCHAR(500)" if not is_sqlite else "ALTER TABLE case_bom_items ADD COLUMN model_url TEXT"
        try:
            await conn.execute(text(stmt_bom))
            logger.info("db_migrate: added column model_url")
        except Exception as e:
            err = str(e).lower()
            if "duplicate" in err or "already exists" in err or "duplicate column" in err:
                pass
            else:
                logger.warning("db_migrate: model_url %s", e)
    await engine.dispose()
