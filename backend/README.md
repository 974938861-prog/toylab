# ToyLab Backend

ToyLab 硬件编程平台后端 API，基于 FastAPI + SQLAlchemy + SQLite（可切换 PostgreSQL）。

## 快速启动

### 1. 创建虚拟环境

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
pip install aiosqlite   # SQLite 异步驱动（Demo 阶段必装）
```

### 3. 填充种子数据

```bash
python -m app.seed
```

这会自动建表并插入示例数据：
- 演示账号：`demo@toylab.io` / `demo1234`
- 14 个商品分类
- 9 个示例商品
- 1 个示例案例（Electro-Bean）含 BOM、制作步骤、数字资源

### 4. 启动开发服务器

```bash
uvicorn app.main:app --reload --port 8000
```

启动后访问：
- API 文档（Swagger）：http://localhost:8000/docs
- 交互式文档（ReDoc）：http://localhost:8000/redoc

## 项目结构

```
backend/
├── alembic/              # 数据库迁移脚本
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── alembic.ini
├── app/
│   ├── main.py           # FastAPI 入口
│   ├── config.py         # 配置（读取 .env）
│   ├── database.py       # 数据库连接
│   ├── seed.py           # 种子数据
│   ├── models/           # SQLAlchemy 数据模型
│   │   ├── user.py       # 用户
│   │   ├── project.py    # 项目 & 编程文件
│   │   ├── product.py    # 商品 & 分类
│   │   ├── user_part.py  # 用户零件库
│   │   ├── case.py       # 灵感案例 & BOM & SOP
│   │   ├── community.py  # 收藏 & 评论 & 浏览
│   │   └── order.py      # 购物车 & 订单
│   ├── schemas/          # Pydantic 请求/响应模型
│   ├── api/              # API 路由
│   │   ├── deps.py       # 公共依赖（认证等）
│   │   ├── auth.py       # 注册 / 登录
│   │   ├── users.py      # 用户资料
│   │   ├── projects.py   # 项目 CRUD
│   │   ├── parts.py      # 我的零件库
│   │   ├── shop.py       # 零件商城
│   │   ├── cases.py      # 灵感案例
│   │   ├── favorites.py  # 收藏
│   │   └── orders.py     # 订单
│   └── services/
│       └── auth.py       # JWT & 密码哈希
├── requirements.txt
├── .env                  # 环境变量
└── .env.example
```

## API 概览

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/v1/auth` | 注册、登录、获取当前用户 |
| 用户 | `/api/v1/users` | 更新个人资料、设置 |
| 项目 | `/api/v1/projects` | 项目 CRUD、编程文件保存 |
| 零件库 | `/api/v1/parts` | 我的零件增删改查 |
| 商城 | `/api/v1/shop` | 商品列表、搜索、购物车 |
| 案例 | `/api/v1/cases` | 案例列表、详情、评论 |
| 收藏 | `/api/v1/favorites` | 收藏/取消收藏 |
| 订单 | `/api/v1/orders` | 下单、订单列表 |

## 切换到 PostgreSQL

修改 `.env` 中的 `DATABASE_URL`：

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/toylab
```

安装 PostgreSQL 驱动：

```bash
pip install asyncpg psycopg2-binary
```

使用 Alembic 迁移：

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```
