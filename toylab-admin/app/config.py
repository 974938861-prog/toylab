from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    PROJECT_NAME: str = "ToyLab"
    API_V1_PREFIX: str = "/api/v1"

    # 与 toylab-service 一致；密码中的 @ 需写成 %40
    DATABASE_URL: str = "mysql+aiomysql://root:admin%40123456@localhost:3306/toylab?charset=utf8mb4"
    SECRET_KEY: str = "toylab-dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "./uploads"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

ASYNC_DB_URL = settings.DATABASE_URL
# SQLAdmin 使用同步 engine 更稳定；与 ASYNC_DB_URL 同库
SYNC_DB_URL = settings.DATABASE_URL.replace("mysql+aiomysql://", "mysql+pymysql://")

UPLOAD_PATH = Path(settings.UPLOAD_DIR)
UPLOAD_PATH.mkdir(parents=True, exist_ok=True)
