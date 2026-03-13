# ToyLab 管理端前端

管理端**只写前端页面**，所有业务（案例 CRUD、封面上传等）在 **toylab-service** 中。

## 运行

1. 先启动 **toylab-service**（端口 8001），并确保有管理员账号（role=admin）。
2. 在本地进入本目录执行：

```bash
npm install
npm run dev
```

3. 打开 http://localhost:3003 ，使用管理员邮箱/密码登录。

## 代理

开发时 Vite 会把 `/api` 和 `/uploads` 代理到 `http://localhost:8001`，无需跨域。

## 接口

- 登录：`POST /api/auth/login`（需 admin 角色）
- 案例列表：`GET /api/admin/cases`
- 案例详情：`GET /api/admin/cases/:id`
- 更新案例：`PUT /api/admin/cases/:id`
- 封面上传：`POST /api/admin/upload/cover`（multipart）
