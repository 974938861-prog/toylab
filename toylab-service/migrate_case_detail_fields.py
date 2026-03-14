"""一次性迁移：为案例详情编辑增加 designer_story、demo_video_url、preview_3d_url、creator_display_name、BOM.model_url。
运行: cd toylab-service && python migrate_case_detail_fields.py
需已配置 DATABASE_URL 或使用默认 MySQL。SQLite 使用 TEXT 类型。
"""
import os
import re

DATABASE_URL = os.environ.get("DATABASE_URL") or "mysql+aiomysql://root:admin%40123456@localhost:3306/toylab?charset=utf8mb4"
SYNC_URL = re.sub(r"^mysql\+aiomysql", "mysql+pymysql", DATABASE_URL)
SYNC_URL = re.sub(r"^sqlite\+aiosqlite", "sqlite", SYNC_URL)
# SQLite 路径保留三个斜杠
if SYNC_URL.startswith("sqlite:///") and not os.environ.get("DATABASE_URL"):
    SYNC_URL = "sqlite:///toylab.db"


def run():
    from sqlalchemy import create_engine, text
    is_sqlite = "sqlite" in SYNC_URL
    engine = create_engine(SYNC_URL)
    with engine.connect() as conn:
        cases_cols = [
            ("designer_story", "ALTER TABLE cases_ ADD COLUMN designer_story TEXT"),
            ("demo_video_url", "ALTER TABLE cases_ ADD COLUMN demo_video_url VARCHAR(500)" if not is_sqlite else "ALTER TABLE cases_ ADD COLUMN demo_video_url TEXT"),
            ("preview_3d_url", "ALTER TABLE cases_ ADD COLUMN preview_3d_url VARCHAR(500)" if not is_sqlite else "ALTER TABLE cases_ ADD COLUMN preview_3d_url TEXT"),
            ("creator_display_name", "ALTER TABLE cases_ ADD COLUMN creator_display_name VARCHAR(200)" if not is_sqlite else "ALTER TABLE cases_ ADD COLUMN creator_display_name TEXT"),
        ]
        for name, stmt in cases_cols:
            try:
                conn.execute(text(stmt))
                conn.commit()
                print(f"OK: {name}")
            except Exception as e:
                if "duplicate" in str(e).lower() or "already exists" in str(e).lower() or "Duplicate column" in str(e):
                    print(f"Skip (exists): {name}")
                else:
                    print(f"Error {name}: {e}")
        stmt_bom = "ALTER TABLE case_bom_items ADD COLUMN model_url VARCHAR(500)" if not is_sqlite else "ALTER TABLE case_bom_items ADD COLUMN model_url TEXT"
        try:
            conn.execute(text(stmt_bom))
            conn.commit()
            print("OK: model_url")
        except Exception as e:
            if "duplicate" in str(e).lower() or "already exists" in str(e).lower() or "Duplicate column" in str(e):
                print("Skip (exists): model_url")
            else:
                print(f"Error model_url: {e}")


if __name__ == "__main__":
    run()
