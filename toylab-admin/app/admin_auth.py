"""SQLAdmin 后台登录认证"""
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

from app.config import settings

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "toylab2026"


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username", "")
        password = form.get("password", "")
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            request.session.update({"admin_logged_in": "1"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("admin_logged_in") == "1"


admin_auth = AdminAuth(secret_key=settings.SECRET_KEY)
