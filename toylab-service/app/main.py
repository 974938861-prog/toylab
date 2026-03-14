import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from starlette.staticfiles import StaticFiles

from app.config import UPLOAD_PATH, settings
from app.db_migrate import ensure_case_columns_async
from app.api.auth import router as auth_router
from app.api.cases import router as cases_router
from app.api.products import router as products_router
from app.api.favorites import router as favorites_router
from app.api.comments import router as comments_router
from app.api.projects import router as projects_router
from app.api.user_parts import router as user_parts_router
from app.api.cart import router as cart_router
from app.api.admin import router as admin_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

# 确保 JSON 响应明确使用 UTF-8，避免前端中文变成问号
class UTF8JSONResponse(JSONResponse):
    charset = "utf-8"

app = FastAPI(
    title="ToyLab Service",
    version="0.6.0",
    default_response_class=UTF8JSONResponse,
)

# allow_credentials=True 时不能使用 allow_origins=["*"]，需明确列出前端地址
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(products_router)
app.include_router(favorites_router)
app.include_router(comments_router)
app.include_router(projects_router)
app.include_router(user_parts_router)
app.include_router(cart_router)
app.include_router(admin_router)


@app.on_event("startup")
async def _startup_migrate():
    """启动时自动补全 cases_ 表缺失列（如 creator_display_name），避免编辑案例后 web 不更新。"""
    try:
        await ensure_case_columns_async(settings.DATABASE_URL)
    except Exception:
        pass


# 上传文件由 service 统一提供，管理端/Web 均通过此处访问
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_PATH.resolve())), name="uploads")


# 与 CORSMiddleware 一致，异常响应也带上 CORS 头，避免浏览器报 CORS 并掩盖真实错误
_CORS_ORIGINS = [
    "http://localhost:3000", "http://127.0.0.1:3000",
    "http://localhost:3001", "http://127.0.0.1:3001",
    "http://localhost:3003", "http://127.0.0.1:3003",
]


def _cors_headers(origin: str | None) -> dict:
    o = (origin or "").strip().rstrip("/")
    if o in _CORS_ORIGINS:
        return {"Access-Control-Allow-Origin": origin if origin else _CORS_ORIGINS[0]}
    return {"Access-Control-Allow-Origin": _CORS_ORIGINS[0]}


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    """保证 HTTPException 的 detail 原样返回给前端，不被下面的全局 handler 覆盖。"""
    headers = _cors_headers(request.headers.get("origin"))
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=headers)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    detail = str(exc) if str(exc) else "服务器内部错误"
    headers = _cors_headers(request.headers.get("origin"))
    return JSONResponse(
        status_code=500,
        content={"detail": f"服务器内部错误：{detail}"},
        headers=headers,
    )


@app.get("/")
async def root():
    return {"name": "ToyLab Service", "version": "0.6.0"}
