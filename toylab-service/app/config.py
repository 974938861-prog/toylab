from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ToyLab Service"
    # 密码中的 @ 需写成 %40，否则 URL 解析会错误
    DATABASE_URL: str = "mysql+aiomysql://root:admin%40123456@localhost:3306/toylab?charset=utf8mb4"
    JWT_SECRET: str = "toylab-jwt-secret-key-2025-change-in-production"
    JWT_EXPIRE_DAYS: int = 7
    UPLOAD_DIR: str = "./uploads"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
UPLOAD_PATH = Path(settings.UPLOAD_DIR)
UPLOAD_PATH.mkdir(parents=True, exist_ok=True)
