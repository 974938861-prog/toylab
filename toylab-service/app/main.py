from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.staticfiles import StaticFiles

from app.config import UPLOAD_PATH
from app.api.auth import router as auth_router
from app.api.cases import router as cases_router
from app.api.products import router as products_router
from app.api.favorites import router as favorites_router
from app.api.comments import router as comments_router
from app.api.projects import router as projects_router
from app.api.user_parts import router as user_parts_router
from app.api.cart import router as cart_router
from app.api.admin import router as admin_router

# 确保 JSON 响应明确使用 UTF-8，避免前端中文变成问号
class UTF8JSONResponse(JSONResponse):
    charset = "utf-8"

app = FastAPI(
    title="ToyLab Service",
    version="0.6.0",
    default_response_class=UTF8JSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# 上传文件由 service 统一提供，管理端/Web 均通过此处访问
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_PATH.resolve())), name="uploads")


@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误", "error": str(exc)},
    )


@app.get("/")
async def root():
    return {"name": "ToyLab Service", "version": "0.6.0"}
