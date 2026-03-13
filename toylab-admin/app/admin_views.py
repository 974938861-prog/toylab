"""SQLAdmin 后台管理界面 - 全中文视图配置（MySQL 版）"""

from sqladmin import ModelView
from app.models.user import User
from app.models.product import ProductCategory, Product, ProductImage
from app.models.project import Project
from app.models.user_part import UserPart
from app.models.case import Case, CaseBomItem, CaseStep, CaseResource, CaseDevLog
from app.models.community import Favorite, Comment
from app.models.order import CartItem


# ══════════════════════════════════════════════════════════
# 用户管理
# ══════════════════════════════════════════════════════════

class UserAdmin(ModelView, model=User):
    name = "用户"
    name_plural = "用户管理"
    icon = "fa-solid fa-users"
    category = "用户与社区"

    column_list = [User.username, User.email, User.nickname, User.role,
                   User.avatar_color, User.created_at]
    column_searchable_list = [User.username, User.email]
    column_sortable_list = [User.created_at, User.username, User.role]
    column_default_sort = [(User.created_at, True)]

    form_columns = [User.username, User.email, User.nickname, User.role,
                    User.avatar_color, User.avatar_url, User.bio]

    column_labels = {
        User.username: "用户名",
        User.email: "邮箱",
        User.nickname: "昵称",
        User.role: "角色",
        User.avatar_color: "头像背景色",
        User.avatar_url: "头像图片",
        User.bio: "个人简介",
        User.created_at: "注册时间",
        User.updated_at: "更新时间",
    }
    form_include_pk = False
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True
    page_size = 20


# ══════════════════════════════════════════════════════════
# 商品分类
# ══════════════════════════════════════════════════════════

class ProductCategoryAdmin(ModelView, model=ProductCategory):
    name = "商品分类"
    name_plural = "商品分类"
    icon = "fa-solid fa-folder-tree"
    category = "商城管理"

    column_list = [ProductCategory.id, ProductCategory.name,
                   ProductCategory.slug, ProductCategory.parent,
                   ProductCategory.sort_order]
    column_searchable_list = [ProductCategory.name, ProductCategory.slug]
    column_sortable_list = [ProductCategory.sort_order, ProductCategory.id]
    column_default_sort = [(ProductCategory.sort_order, False)]

    form_columns = [ProductCategory.name, ProductCategory.slug,
                    ProductCategory.icon, ProductCategory.parent,
                    ProductCategory.sort_order]

    column_labels = {
        ProductCategory.id: "编号",
        ProductCategory.name: "分类名称",
        ProductCategory.slug: "标识符",
        ProductCategory.icon: "图标",
        ProductCategory.parent: "父分类",
        ProductCategory.parent_id: "父分类",
        ProductCategory.sort_order: "排序",
    }
    page_size = 30


# ══════════════════════════════════════════════════════════
# 商品
# ══════════════════════════════════════════════════════════

class ProductAdmin(ModelView, model=Product):
    name = "商品"
    name_plural = "商品管理"
    icon = "fa-solid fa-box"
    category = "商城管理"

    column_list = [Product.name, Product.category,
                   Product.spec, Product.price,
                   Product.stock_status,
                   Product.sales_count, Product.view_count]
    column_searchable_list = [Product.name, Product.slug, Product.spec]
    column_sortable_list = [Product.price, Product.sales_count, Product.created_at]
    column_default_sort = [(Product.created_at, True)]

    form_columns = [
        Product.name,
        Product.slug,
        Product.category,
        Product.spec,
        Product.description,
        Product.price,
        Product.stock_status,
        Product.cover_url,
        Product.model_3d_url,
    ]

    column_labels = {
        Product.name: "商品名称",
        Product.category: "所属分类",
        Product.category_id: "所属分类",
        Product.slug: "标识符",
        Product.spec: "规格参数",
        Product.description: "商品描述",
        Product.price: "单价",
        Product.stock_status: "库存状态",
        Product.sales_count: "累计销量",
        Product.view_count: "浏览量",
        Product.cover_url: "封面图地址",
        Product.model_3d_url: "3D 模型地址",
        Product.created_at: "创建时间",
    }
    column_formatters = {
        Product.price: lambda m, n: f'¥ {m.price:.2f}' if m.price else "—",
        Product.stock_status: lambda m, n: {
            "in_stock": "有货", "out_of_stock": "缺货", "pre_order": "预订",
        }.get(m.stock_status, m.stock_status),
    }

    can_view_details = True
    page_size = 20


# ══════════════════════════════════════════════════════════
# 案例管理
# ══════════════════════════════════════════════════════════

class CaseAdmin(ModelView, model=Case):
    name = "案例"
    name_plural = "案例管理"
    icon = "fa-solid fa-lightbulb"
    category = "灵感案例"

    column_list = [Case.title, Case.creator, Case.difficulty,
                   Case.price, Case.estimated_time,
                   Case.view_count, Case.sales_count,
                   Case.is_published]
    column_searchable_list = [Case.title, Case.description]
    column_sortable_list = [Case.view_count, Case.sales_count,
                            Case.price, Case.created_at]
    column_default_sort = [(Case.created_at, True)]

    form_columns = [
        Case.title,
        Case.slug,
        Case.creator,
        Case.description,
        Case.difficulty,
        Case.estimated_time,
        Case.price,
        Case.is_free,
        Case.cover_url,
        Case.is_published,
    ]
    form_args = {"cover_url": {"label": "封面图地址", "description": "可填 /uploads/cases/xxx.jpg；上传请用管理端前端（frontend）"}}
    edit_template = "sqladmin/case_edit.html"

    column_labels = {
        Case.title: "案例名称",
        Case.slug: "标识符",
        Case.creator: "创作者",
        Case.creator_id: "创作者",
        Case.description: "简介",
        Case.difficulty: "难度",
        Case.price: "价格",
        Case.is_free: "免费",
        Case.estimated_time: "预计完成时间",
        Case.view_count: "浏览量",
        Case.sales_count: "购买量",
        Case.is_published: "已发布",
        Case.cover_url: "封面图地址",
        Case.created_at: "创建时间",
        Case.updated_at: "更新时间",
    }
    column_formatters = {
        Case.price: lambda m, n: f'¥ {m.price:.0f}' if m.price else "免费",
        Case.is_published: lambda m, n: "已发布" if m.is_published else "草稿",
        Case.is_free: lambda m, n: "是" if m.is_free else "否",
    }
    can_view_details = True
    page_size = 20


class CaseBomItemAdmin(ModelView, model=CaseBomItem):
    name = "物料"
    name_plural = "物料清单"
    icon = "fa-solid fa-list-check"
    category = "灵感案例"

    column_list = [CaseBomItem.case, CaseBomItem.item_type,
                   CaseBomItem.name, CaseBomItem.spec,
                   CaseBomItem.unit_price, CaseBomItem.required_qty,
                   CaseBomItem.product, CaseBomItem.sort_order]
    column_searchable_list = [CaseBomItem.name]
    column_sortable_list = [CaseBomItem.sort_order]
    column_default_sort = [(CaseBomItem.sort_order, False)]

    form_columns = [CaseBomItem.case, CaseBomItem.item_type,
                    CaseBomItem.name, CaseBomItem.spec,
                    CaseBomItem.unit_price, CaseBomItem.required_qty,
                    CaseBomItem.product, CaseBomItem.doc_url,
                    CaseBomItem.sort_order]

    column_labels = {
        CaseBomItem.case: "所属案例",
        CaseBomItem.case_id: "所属案例",
        CaseBomItem.item_type: "物料类型",
        CaseBomItem.name: "物料名称",
        CaseBomItem.spec: "规格参数",
        CaseBomItem.unit_price: "单价",
        CaseBomItem.required_qty: "所需数量",
        CaseBomItem.product: "关联商品",
        CaseBomItem.product_id: "关联商品",
        CaseBomItem.doc_url: "文档地址",
        CaseBomItem.sort_order: "排序",
    }
    column_formatters = {
        CaseBomItem.unit_price: lambda m, n: f'¥ {m.unit_price:.0f}' if m.unit_price else '—',
        CaseBomItem.item_type: lambda m, n: {
            "device": "设备", "material": "材料",
            "electronic": "电子模块", "mechanical": "机械件",
        }.get(m.item_type, m.item_type),
    }
    page_size = 30


class CaseStepAdmin(ModelView, model=CaseStep):
    name = "制作步骤"
    name_plural = "制作步骤"
    icon = "fa-solid fa-stairs"
    category = "灵感案例"

    column_list = [CaseStep.case, CaseStep.step_number,
                   CaseStep.title, CaseStep.duration_minutes]
    column_sortable_list = [CaseStep.step_number]
    column_default_sort = [(CaseStep.step_number, False)]

    form_columns = [CaseStep.case, CaseStep.step_number,
                    CaseStep.title, CaseStep.description,
                    CaseStep.image_url, CaseStep.video_url,
                    CaseStep.duration_minutes]

    column_labels = {
        CaseStep.case: "所属案例",
        CaseStep.case_id: "所属案例",
        CaseStep.step_number: "步骤编号",
        CaseStep.title: "步骤标题",
        CaseStep.description: "步骤说明",
        CaseStep.image_url: "步骤图片",
        CaseStep.video_url: "步骤视频",
        CaseStep.duration_minutes: "时长(分钟)",
    }
    page_size = 30


class CaseResourceAdmin(ModelView, model=CaseResource):
    name = "数字资源"
    name_plural = "数字资源包"
    icon = "fa-solid fa-file-zipper"
    category = "灵感案例"

    column_list = [CaseResource.case, CaseResource.resource_type,
                   CaseResource.name, CaseResource.description]
    column_searchable_list = [CaseResource.name]

    form_columns = [CaseResource.case, CaseResource.resource_type,
                    CaseResource.name, CaseResource.description,
                    CaseResource.file_url, CaseResource.file_size,
                    CaseResource.sort_order]

    column_labels = {
        CaseResource.case: "所属案例",
        CaseResource.case_id: "所属案例",
        CaseResource.resource_type: "资源类型",
        CaseResource.name: "资源名称",
        CaseResource.description: "说明",
        CaseResource.file_url: "下载地址",
        CaseResource.file_size: "文件大小",
        CaseResource.sort_order: "排序",
    }
    page_size = 20


class CaseDevLogAdmin(ModelView, model=CaseDevLog):
    name = "开发日志"
    name_plural = "开发日志"
    icon = "fa-solid fa-clock-rotate-left"
    category = "灵感案例"

    column_list = [CaseDevLog.case, CaseDevLog.log_date,
                   CaseDevLog.title, CaseDevLog.content]
    column_sortable_list = [CaseDevLog.log_date]
    column_default_sort = [(CaseDevLog.log_date, True)]

    form_columns = [CaseDevLog.case, CaseDevLog.log_date,
                    CaseDevLog.title, CaseDevLog.content,
                    CaseDevLog.sort_order]

    column_labels = {
        CaseDevLog.case: "所属案例",
        CaseDevLog.case_id: "所属案例",
        CaseDevLog.title: "日志标题",
        CaseDevLog.content: "日志内容",
        CaseDevLog.log_date: "日期",
        CaseDevLog.sort_order: "排序",
    }
    page_size = 20


# ══════════════════════════════════════════════════════════
# 项目管理
# ══════════════════════════════════════════════════════════

class ProjectAdmin(ModelView, model=Project):
    name = "项目"
    name_plural = "用户项目"
    icon = "fa-solid fa-diagram-project"
    category = "工作室"

    column_list = [Project.name, Project.user,
                   Project.is_public, Project.updated_at]
    column_searchable_list = [Project.name]
    column_sortable_list = [Project.updated_at, Project.created_at]
    column_default_sort = [(Project.updated_at, True)]

    form_columns = [Project.user, Project.name,
                    Project.description, Project.cover_url, Project.is_public]

    column_labels = {
        Project.name: "项目名称",
        Project.user: "所属用户",
        Project.user_id: "所属用户",
        Project.description: "项目描述",
        Project.cover_url: "封面图",
        Project.is_public: "公开",
        Project.updated_at: "最近更新",
        Project.created_at: "创建时间",
    }
    column_formatters = {
        Project.is_public: lambda m, n: "公开" if m.is_public else "私有",
    }
    can_view_details = True
    page_size = 20


# ══════════════════════════════════════════════════════════
# 用户零件库
# ══════════════════════════════════════════════════════════

class UserPartAdmin(ModelView, model=UserPart):
    name = "用户零件"
    name_plural = "用户零件库"
    icon = "fa-solid fa-microchip"
    category = "工作室"

    column_list = [UserPart.user, UserPart.product,
                   UserPart.quantity, UserPart.last_used_project,
                   UserPart.firmware_version, UserPart.added_at]
    column_sortable_list = [UserPart.quantity, UserPart.added_at]
    column_default_sort = [(UserPart.added_at, True)]

    form_columns = [UserPart.user, UserPart.product,
                    UserPart.quantity, UserPart.last_used_project,
                    UserPart.firmware_version]

    column_labels = {
        UserPart.user: "用户",
        UserPart.user_id: "用户",
        UserPart.product: "零件商品",
        UserPart.product_id: "零件商品",
        UserPart.quantity: "数量",
        UserPart.last_used_project: "上次使用项目",
        UserPart.firmware_version: "固件版本",
        UserPart.added_at: "添加日期",
    }
    page_size = 20


# ══════════════════════════════════════════════════════════
# 社区
# ══════════════════════════════════════════════════════════

class CommentAdmin(ModelView, model=Comment):
    name = "评论"
    name_plural = "评论管理"
    icon = "fa-solid fa-comments"
    category = "用户与社区"

    column_list = [Comment.user, Comment.target_type,
                   Comment.target_id, Comment.content,
                   Comment.created_at]
    column_searchable_list = [Comment.content]
    column_sortable_list = [Comment.created_at]
    column_default_sort = [(Comment.created_at, True)]

    form_columns = [Comment.user, Comment.target_type,
                    Comment.target_id, Comment.content]

    column_labels = {
        Comment.user: "评论者",
        Comment.user_id: "评论者",
        Comment.target_type: "评论对象类型",
        Comment.target_id: "对象标识",
        Comment.content: "评论内容",
        Comment.created_at: "评论时间",
    }
    column_formatters = {
        Comment.target_type: lambda m, n: {
            "case": "案例", "product": "商品",
        }.get(m.target_type, m.target_type),
    }
    can_view_details = True
    page_size = 20


class FavoriteAdmin(ModelView, model=Favorite):
    name = "收藏"
    name_plural = "收藏记录"
    icon = "fa-solid fa-heart"
    category = "用户与社区"

    column_list = [Favorite.user, Favorite.target_type,
                   Favorite.target_id, Favorite.created_at]
    column_sortable_list = [Favorite.created_at]
    column_default_sort = [(Favorite.created_at, True)]

    form_columns = [Favorite.user, Favorite.target_type,
                    Favorite.target_id]

    column_labels = {
        Favorite.user: "用户",
        Favorite.user_id: "用户",
        Favorite.target_type: "收藏类型",
        Favorite.target_id: "对象标识",
        Favorite.created_at: "收藏时间",
    }
    column_formatters = {
        Favorite.target_type: lambda m, n: {
            "case": "案例", "product": "商品",
        }.get(m.target_type, m.target_type),
    }
    page_size = 20


# ══════════════════════════════════════════════════════════
# 购物车
# ══════════════════════════════════════════════════════════

class CartItemAdmin(ModelView, model=CartItem):
    name = "购物车"
    name_plural = "购物车"
    icon = "fa-solid fa-basket-shopping"
    category = "商城管理"

    column_list = [CartItem.user, CartItem.product,
                   CartItem.quantity, CartItem.created_at]
    column_sortable_list = [CartItem.created_at]
    column_default_sort = [(CartItem.created_at, True)]

    form_columns = [CartItem.user, CartItem.product, CartItem.quantity]

    column_labels = {
        CartItem.user: "用户",
        CartItem.user_id: "用户",
        CartItem.product: "商品",
        CartItem.product_id: "商品",
        CartItem.quantity: "数量",
        CartItem.created_at: "加入时间",
    }
    page_size = 20


# ──────────────────────────────────────────────────────────
# 注册列表
# ──────────────────────────────────────────────────────────
ALL_VIEWS = [
    UserAdmin,
    ProductCategoryAdmin,
    ProductAdmin,
    CaseAdmin,
    CaseBomItemAdmin,
    CaseStepAdmin,
    CaseResourceAdmin,
    CaseDevLogAdmin,
    ProjectAdmin,
    UserPartAdmin,
    CommentAdmin,
    FavoriteAdmin,
    CartItemAdmin,
]
