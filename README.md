# ToyLab v0.6

ToyLab 是一个玩具创造平台，包含三个独立项目：

## 项目结构

```
toylab v0.6/
├── toylab-web/          # 用户前端 (Next.js)       → localhost:3000
├── toylab-admin/        # 管理后台 (FastAPI+SQLAdmin) → localhost:8000
├── toylab-service/      # 业务后端 (FastAPI+MySQL)   → localhost:8001
├── mysql/               # 数据库初始化脚本
├── prototype/           # 原型设计稿
└── README.md
```

## 快速启动

### 1. 初始化数据库

确保 MySQL 服务已启动（root / admin@123456），然后执行：

```bash
mysql -u root -padmin@123456 < mysql/001_create_database.sql
mysql -u root -padmin@123456 toylab < mysql/002_seed_data.sql
```

### 2. 启动业务后端 (toylab-service)

```bash
cd toylab-service
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

### 3. 启动管理后台 (toylab-admin)

```bash
cd toylab-admin
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### 4. 启动用户前端 (toylab-web)

```bash
cd toylab-web
npm install
npm run dev
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 用户前端 | http://localhost:3000 | 面向用户 |
| 管理后台 | http://localhost:8000/admin | 管理员登录: admin / toylab2026 |
| 业务 API | http://localhost:8001 | API 文档: http://localhost:8001/docs |

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: FastAPI, SQLAlchemy, aiomysql
- **数据库**: MySQL 8.0+
- **管理**: SQLAdmin
