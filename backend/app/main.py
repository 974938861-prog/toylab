from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqladmin import Admin

from app.config import settings
from app.database import init_db, engine
from app.admin_views import ALL_VIEWS
from app.admin_auth import admin_auth

BASE_DIR = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.6.0",
    lifespan=lifespan,
)

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

admin = Admin(
    app,
    engine,
    title="ToyLab 后台管理",
    base_url="/admin",
    templates_dir=str(BASE_DIR / "templates"),
    authentication_backend=admin_auth,
)
for view in ALL_VIEWS:
    admin.add_view(view)


@app.get("/")
async def root():
    return {"name": "ToyLab API", "version": "0.6.0", "docs": "/docs", "admin": "/admin"}
