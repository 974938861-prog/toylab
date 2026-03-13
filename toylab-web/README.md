# ToyLab Web - 用户前端

ToyLab 面向用户的 Web 前端，基于 Next.js。

## 技术栈

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 3000)
npm run dev
```

## 环境变量

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 架构说明

- 前端通过 Next.js rewrites 代理 `/api/*` 请求到 toylab-service
- 认证使用 Bearer Token (JWT)，存储在 localStorage
- 不包含任何直接的数据库连接代码

## 页面

| 路径 | 说明 |
|------|------|
| `/discover` | 发现页 - 浏览案例 |
| `/shop` | 零件商城 |
| `/studio` | 工作室 |
| `/projects` | 我的作品库 |
| `/case/[id]` | 案例详情 |
| `/login` | 登录/注册 |

## 端口

默认运行在 `http://localhost:3000`
