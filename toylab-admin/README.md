# ToyLab Admin - 管理后台

**架构原则：管理端只写前端页面，业务都放在 toylab-service 中。**

## 管理端前端（推荐）

- 位置：`frontend/`
- 技术：Vite + React + TypeScript，纯前端，所有数据与上传均调用 **toylab-service** 的 `/api/admin/*` 与 `/api/auth/login`。
- 运行：先启动 **toylab-service**（如 8001），再在 `frontend/` 下执行 `npm install`、`npm run dev`，访问 http://localhost:3003 ，使用**管理员账号**（role=admin）登录。

详见 `frontend/README.md`。

## 旧版 Python 管理端（Legacy）

- 基于 FastAPI + SQLAdmin，直接连库、自带封面上传，适合本地快速维护。
- 运行：`pip install -r requirements.txt` 后 `uvicorn app.main:app --port 8002 --reload`，访问 http://localhost:8002/admin 。
- 登录：见 `app/admin_auth.py` 中配置（如用户名 admin / 密码 toylab2026）。
- **封面图**：已统一由 **toylab-service** 提供存储与访问（`toylab-service/uploads/cases/`）。本目录下的 `uploads/` 为历史遗留，已复制到 service，新上传请使用管理端前端 + service。
- 后续可逐步用 frontend + service 替代，或保留作备用。
