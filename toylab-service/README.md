# ToyLab Service - 业务后端

ToyLab 业务后端 API 服务，基于 FastAPI + MySQL。

## 技术栈

- Python 3.12+
- FastAPI
- SQLAlchemy (async)
- aiomysql
- JWT 认证

## 快速启动

```bash
# 创建虚拟环境
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 启动服务 (端口 8001)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
DATABASE_URL=mysql+aiomysql://root:admin@123456@localhost:3306/toylab?charset=utf8mb4
JWT_SECRET=your-jwt-secret
JWT_EXPIRE_DAYS=7
```

## API 端点

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/me` | GET | 获取当前用户 |
| `/api/cases` | GET | 案例列表 |
| `/api/cases/{id}` | GET | 案例详情 |
| `/api/products` | GET | 商品列表 |
| `/api/product-categories` | GET | 商品分类 |
| `/api/favorites` | GET/POST/DELETE | 收藏管理 |
| `/api/comments` | POST | 发表评论 |
| `/api/projects` | GET/POST/DELETE | 项目管理 |
| `/api/user-parts` | GET | 用户零件 |
| `/api/cart` | POST | 加入购物车 |

## 端口

默认运行在 `http://localhost:8001`
