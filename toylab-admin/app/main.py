import io
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.datastructures import FormData, UploadFile
from starlette.requests import Request
from starlette.responses import Response, PlainTextResponse
from starlette.staticfiles import StaticFiles
from sqladmin import Admin
from sqlalchemy import select, func

from app.config import settings, UPLOAD_PATH

# 猴子补丁：修复 SQLAdmin 在编辑时把字符串字段（如 cover_url）当文件处理导致的 'str' has no attribute 'name'
async def _patched_handle_form_data(self: Any, request: Request, obj: Any = None) -> FormData:
    form = await request.form()
    form_data: list[tuple[str, Any]] = []
    for key, value in form.multi_items():
        if not isinstance(value, UploadFile):
            form_data.append((key, value))
            continue
        should_clear = form.get(key + "_checkbox")
        empty_upload = len(await value.read(1)) != 1
        await value.seek(0)
        if should_clear:
            form_data.append((key, UploadFile(io.BytesIO(b""))))
        elif empty_upload and obj and getattr(obj, key):
            current = getattr(obj, key)
            if isinstance(current, str):
                form_data.append((key, current))
            else:
                form_data.append((key, UploadFile(filename=current.name, file=current.open())))
        else:
            form_data.append((key, value))
    return FormData(form_data)


Admin._handle_form_data = _patched_handle_form_data
from app.database import init_db, engine, async_session, sync_engine
from app.admin_views import ALL_VIEWS
from app.admin_auth import admin_auth
from app.models.user import User
from app.models.case import Case
from app.models.product import Product
from app.models.project import Project
from app.models.community import Comment, Favorite
from app.models.order import CartItem

BASE_DIR = Path(__file__).resolve().parent


class ToyLabAdmin(Admin):
    """自定义首页：仪表盘统计 + 快捷入口（与用户端发现/商城/工作室对应）"""

    async def index(self, request: Request) -> Response:
        stats = {
            "users": 0,
            "cases": 0,
            "products": 0,
            "projects": 0,
            "comments": 0,
            "favorites": 0,
            "cart_items": 0,
        }
        try:
            async with async_session() as session:
                for model, key in [
                    (User, "users"),
                    (Case, "cases"),
                    (Product, "products"),
                    (Project, "projects"),
                    (Comment, "comments"),
                    (Favorite, "favorites"),
                    (CartItem, "cart_items"),
                ]:
                    r = await session.execute(select(func.count()).select_from(model))
                    stats[key] = r.scalar() or 0
        except Exception:
            pass

        # 快捷入口：从已注册的 view 取 identity 生成列表页链接
        links = []
        view_identity_by_model = {}
        for view in getattr(self, "_views", []) or []:
            identity = getattr(view, "identity", None)
            name_plural = getattr(view, "name_plural", view.__class__.__name__)
            if identity:
                try:
                    url = str(request.url_for("admin:list", identity=identity))
                    links.append({"name": name_plural, "url": url})
                    model = getattr(view, "model", None)
                    if model is not None:
                        view_identity_by_model[model] = (url, name_plural)
                except Exception:
                    pass

        # 四个主卡片对应：用户、案例、商品、项目（与 web 发现/商城/工作室/我的对应）
        main_cards = [
            {"label": "用户", "value": stats["users"], "desc": "对应「我的」等用户数据", "url": view_identity_by_model.get(User, ("#", "用户管理"))[0]},
            {"label": "案例", "value": stats["cases"], "desc": "对应「发现」页案例", "url": view_identity_by_model.get(Case, ("#", "案例管理"))[0]},
            {"label": "商品", "value": stats["products"], "desc": "对应「零件商城」", "url": view_identity_by_model.get(Product, ("#", "商品管理"))[0]},
            {"label": "项目", "value": stats["projects"], "desc": "对应「工作室」用户项目", "url": view_identity_by_model.get(Project, ("#", "项目管理"))[0]},
        ]

        return await self.templates.TemplateResponse(
            request,
            "sqladmin/index.html",
            {"admin": self, "stats": stats, "links": links, "main_cards": main_cards},
        )


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

admin = ToyLabAdmin(
    app,
    sync_engine,
    title="ToyLab 后台管理",
    base_url="/admin",
    templates_dir=str(BASE_DIR / "templates"),
    authentication_backend=admin_auth,
)
for view in ALL_VIEWS:
    admin.add_view(view)

# 上传目录：封面图等，访问 /uploads/cases/xxx.jpg
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_PATH.resolve())), name="uploads")


async def _debug_exception(request: Request, exc: Exception) -> PlainTextResponse:
    body = f"{type(exc).__name__}: {exc}\n\n{traceback.format_exc()}"
    return PlainTextResponse(body, status_code=500)


app.add_exception_handler(Exception, _debug_exception)
# 挂载的 admin 子应用内部异常也需捕获
admin.admin.add_exception_handler(Exception, _debug_exception)


@app.get("/")
async def root():
    return {"name": "ToyLab API", "version": "0.6.0", "docs": "/docs", "admin": "/admin"}
