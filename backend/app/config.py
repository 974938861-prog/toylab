from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    PROJECT_NAME: str = "ToyLab"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "mysql+aiomysql://root:admin@123456@localhost:3306/toylab?charset=utf8mb4"
    SECRET_KEY: str = "toylab-dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "./uploads"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

ASYNC_DB_URL = settings.DATABASE_URL

UPLOAD_PATH = Path(settings.UPLOAD_DIR)
UPLOAD_PATH.mkdir(parents=True, exist_ok=True)
