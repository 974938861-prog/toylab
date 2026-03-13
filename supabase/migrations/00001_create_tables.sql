-- ============================================================
-- ToyLab Supabase 数据库迁移脚本
-- 00001_create_tables.sql — 建表 + 中文注释
-- ============================================================

-- 启用必要扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. profiles — 用户资料（扩展 auth.users）
-- ============================================================
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE NOT NULL,
  avatar_url    text,
  avatar_color  text DEFAULT '#6366f1',
  role          text NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'creator', 'admin')),
  bio           text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles                IS '用户资料（扩展 Supabase Auth）';
COMMENT ON COLUMN profiles.id             IS '用户 ID，关联 auth.users';
COMMENT ON COLUMN profiles.username       IS '用户名（唯一）';
COMMENT ON COLUMN profiles.avatar_url     IS '头像图片地址';
COMMENT ON COLUMN profiles.avatar_color   IS '头像背景色，如 #7C3AED';
COMMENT ON COLUMN profiles.role           IS '角色：user=普通用户 / creator=创作者 / admin=管理员';
COMMENT ON COLUMN profiles.bio            IS '个人简介';
COMMENT ON COLUMN profiles.created_at     IS '注册时间';
COMMENT ON COLUMN profiles.updated_at     IS '资料更新时间';

-- ============================================================
-- 2. product_categories — 商品分类（树形结构）
-- ============================================================
CREATE TABLE product_categories (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id   bigint REFERENCES product_categories(id) ON DELETE SET NULL,
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  icon        text,
  sort_order  int NOT NULL DEFAULT 0
);

COMMENT ON TABLE  product_categories              IS '商品分类（支持二级树形结构）';
COMMENT ON COLUMN product_categories.id           IS '分类 ID';
COMMENT ON COLUMN product_categories.parent_id    IS '父分类 ID，NULL 表示一级分类';
COMMENT ON COLUMN product_categories.name         IS '分类名称，如"输入模块""齿轮"';
COMMENT ON COLUMN product_categories.slug         IS 'URL 标识符，如 input / gear';
COMMENT ON COLUMN product_categories.icon         IS '分类图标标识';
COMMENT ON COLUMN product_categories.sort_order   IS '排序权重，数字越小越靠前';

-- ============================================================
-- 3. products — 商品
-- ============================================================
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   bigint REFERENCES product_categories(id) ON DELETE SET NULL,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  spec          text,
  description   text,
  price         numeric(10,2) NOT NULL DEFAULT 0,
  stock         int NOT NULL DEFAULT 0,
  stock_status  text NOT NULL DEFAULT 'in_stock'
                CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  module_type   text,
  cover_url     text,
  model_3d_url  text,
  doc_url       text,
  firmware_ver  text,
  sales_count   int NOT NULL DEFAULT 0,
  view_count    int NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  products                IS '商品（电子模块 & 机械配件）';
COMMENT ON COLUMN products.id             IS '商品 ID';
COMMENT ON COLUMN products.category_id    IS '所属分类';
COMMENT ON COLUMN products.name           IS '商品名称，如"手按开关""130有刷电机"';
COMMENT ON COLUMN products.slug           IS 'URL 标识符';
COMMENT ON COLUMN products.spec           IS '规格摘要，如"16×16 · 4PIN · 磁吸"';
COMMENT ON COLUMN products.description    IS '详细描述';
COMMENT ON COLUMN products.price          IS '单价（美元）';
COMMENT ON COLUMN products.stock          IS '库存数量';
COMMENT ON COLUMN products.stock_status   IS '库存状态：in_stock=有货 / low_stock=库存不足 / out_of_stock=缺货';
COMMENT ON COLUMN products.module_type    IS '模块类型：input/output/motor/power/mcu/wire/gear/bearing 等';
COMMENT ON COLUMN products.cover_url      IS '封面图地址';
COMMENT ON COLUMN products.model_3d_url   IS '3D 模型文件地址';
COMMENT ON COLUMN products.doc_url        IS '文档下载地址';
COMMENT ON COLUMN products.firmware_ver   IS '固件版本，如 v2.1.3';
COMMENT ON COLUMN products.sales_count    IS '累计销量';
COMMENT ON COLUMN products.view_count     IS '浏览量';
COMMENT ON COLUMN products.is_published   IS '是否上架';
COMMENT ON COLUMN products.created_at     IS '创建时间';
COMMENT ON COLUMN products.updated_at     IS '更新时间';

-- ============================================================
-- 4. product_images — 商品图片（多图）
-- ============================================================
CREATE TABLE product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  product_images              IS '商品图片（一个商品可有多张图）';
COMMENT ON COLUMN product_images.id           IS '图片 ID';
COMMENT ON COLUMN product_images.product_id   IS '所属商品';
COMMENT ON COLUMN product_images.image_url    IS '图片 URL（Supabase Storage）';
COMMENT ON COLUMN product_images.sort_order   IS '排序';

-- ============================================================
-- 5. projects — 用户项目
-- ============================================================
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT '未命名项目',
  cover_type  text,
  cover_url   text,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  projects              IS '用户项目（工作室中的作品）';
COMMENT ON COLUMN projects.id           IS '项目 ID';
COMMENT ON COLUMN projects.user_id      IS '所属用户';
COMMENT ON COLUMN projects.name         IS '项目名称，如"蓝色智慧小车""LED 台灯"';
COMMENT ON COLUMN projects.cover_type   IS '封面类型标识：car / led / sensor';
COMMENT ON COLUMN projects.cover_url    IS '自定义封面图地址';
COMMENT ON COLUMN projects.description  IS '项目描述';
COMMENT ON COLUMN projects.created_at   IS '创建时间';
COMMENT ON COLUMN projects.updated_at   IS '最近更新时间';

-- ============================================================
-- 6. project_files — 项目编程文件
-- ============================================================
CREATE TABLE project_files (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_type   text NOT NULL CHECK (file_type IN ('blocks', 'workflow', 'python')),
  content     jsonb,
  code_text   text,
  version     int NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  project_files              IS '项目编程文件';
COMMENT ON COLUMN project_files.id           IS '文件 ID';
COMMENT ON COLUMN project_files.project_id   IS '所属项目';
COMMENT ON COLUMN project_files.file_type    IS '文件类型：blocks=积木 / workflow=工作流 / python=Python';
COMMENT ON COLUMN project_files.content      IS '积木或工作流的 JSON 结构数据';
COMMENT ON COLUMN project_files.code_text    IS 'Python 源码文本';
COMMENT ON COLUMN project_files.version      IS '文件版本号';

-- ============================================================
-- 7. project_modules — 画布上的模块实例
-- ============================================================
CREATE TABLE project_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id  uuid REFERENCES products(id) ON DELETE SET NULL,
  module_type text NOT NULL,
  module_key  text NOT NULL,
  position_x  real NOT NULL DEFAULT 0,
  position_y  real NOT NULL DEFAULT 0,
  config      jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  project_modules              IS '画布上放置的模块实例';
COMMENT ON COLUMN project_modules.id           IS '实例 ID';
COMMENT ON COLUMN project_modules.project_id   IS '所属项目';
COMMENT ON COLUMN project_modules.product_id   IS '关联的商品（可选）';
COMMENT ON COLUMN project_modules.module_type  IS '模块类型：power / mainctl / input / output';
COMMENT ON COLUMN project_modules.module_key   IS '模块标识，如 battery-21700、input-button';
COMMENT ON COLUMN project_modules.position_x   IS '画布 X 坐标';
COMMENT ON COLUMN project_modules.position_y   IS '画布 Y 坐标';
COMMENT ON COLUMN project_modules.config       IS '模块配置参数（JSON）';

-- ============================================================
-- 8. user_parts — 用户零件库
-- ============================================================
CREATE TABLE user_parts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity        int NOT NULL DEFAULT 1,
  added_at        timestamptz NOT NULL DEFAULT now(),
  last_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  firmware_ver    text,
  UNIQUE (user_id, product_id)
);

COMMENT ON TABLE  user_parts                  IS '用户零件库（我拥有的零件）';
COMMENT ON COLUMN user_parts.id               IS '记录 ID';
COMMENT ON COLUMN user_parts.user_id          IS '所属用户';
COMMENT ON COLUMN user_parts.product_id       IS '关联商品';
COMMENT ON COLUMN user_parts.quantity          IS '拥有数量';
COMMENT ON COLUMN user_parts.added_at         IS '添加日期';
COMMENT ON COLUMN user_parts.last_project_id  IS '上次使用的项目';
COMMENT ON COLUMN user_parts.firmware_ver     IS '当前固件版本';

-- ============================================================
-- 9. cases — 灵感案例
-- ============================================================
CREATE TABLE cases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  summary         text,
  category        text NOT NULL DEFAULT 'all'
                  CHECK (category IN ('all','car','game','boardgame','pet','tool','peripheral','appliance')),
  cover_url       text,
  preview_3d_url  text,
  video_url       text,
  estimated_time  text,
  price           numeric(10,2) NOT NULL DEFAULT 0,
  view_count      int NOT NULL DEFAULT 0,
  purchase_count  int NOT NULL DEFAULT 0,
  designer_story  text,
  is_published    boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  cases                    IS '灵感案例（发现页展示的玩具方案）';
COMMENT ON COLUMN cases.id                 IS '案例 ID';
COMMENT ON COLUMN cases.creator_id         IS '创作者用户 ID';
COMMENT ON COLUMN cases.title              IS '案例标题，如"Electro-Bean""小狗鲁卡机器人"';
COMMENT ON COLUMN cases.summary            IS '产品简介';
COMMENT ON COLUMN cases.category           IS '分类：car/game/boardgame/pet/tool/peripheral/appliance';
COMMENT ON COLUMN cases.cover_url          IS '封面图';
COMMENT ON COLUMN cases.preview_3d_url     IS '3D 预览模型地址';
COMMENT ON COLUMN cases.video_url          IS '案例演示视频地址';
COMMENT ON COLUMN cases.estimated_time     IS '预计完成时间，如"1h"';
COMMENT ON COLUMN cases.price              IS '案例价格（0 表示免费）';
COMMENT ON COLUMN cases.view_count         IS '浏览量';
COMMENT ON COLUMN cases.purchase_count     IS '购买量';
COMMENT ON COLUMN cases.designer_story     IS '设计者的故事';
COMMENT ON COLUMN cases.is_published       IS '是否已发布';

-- ============================================================
-- 10. case_bom_items — 案例物料清单 (BOM)
-- ============================================================
CREATE TABLE case_bom_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  product_id  uuid REFERENCES products(id) ON DELETE SET NULL,
  item_type   text NOT NULL
              CHECK (item_type IN ('device', 'material', 'module', 'mechanical')),
  name        text NOT NULL,
  spec        text,
  unit_price  numeric(10,2) NOT NULL DEFAULT 0,
  required_qty int NOT NULL DEFAULT 1,
  sort_order  int NOT NULL DEFAULT 0
);

COMMENT ON TABLE  case_bom_items                IS '案例物料清单 (BOM)';
COMMENT ON COLUMN case_bom_items.id             IS 'BOM 项 ID';
COMMENT ON COLUMN case_bom_items.case_id        IS '所属案例';
COMMENT ON COLUMN case_bom_items.product_id     IS '关联商品（可选，设备类可能无对应商品）';
COMMENT ON COLUMN case_bom_items.item_type      IS '类型：device=设备 / material=材料 / module=电子模块 / mechanical=机械零件';
COMMENT ON COLUMN case_bom_items.name           IS '物料名称，如"3mm 紫色亚克力板""按键模块"';
COMMENT ON COLUMN case_bom_items.spec           IS '规格参数，如"600×300mm · 厚3mm"';
COMMENT ON COLUMN case_bom_items.unit_price     IS '单价';
COMMENT ON COLUMN case_bom_items.required_qty   IS '所需数量';
COMMENT ON COLUMN case_bom_items.sort_order     IS '显示排序';

-- ============================================================
-- 11. case_steps — 制作步骤 (SOP)
-- ============================================================
CREATE TABLE case_steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  title       text NOT NULL,
  description text,
  image_url   text,
  UNIQUE (case_id, step_number)
);

COMMENT ON TABLE  case_steps                IS '制作步骤 (SOP)';
COMMENT ON COLUMN case_steps.id             IS '步骤 ID';
COMMENT ON COLUMN case_steps.case_id        IS '所属案例';
COMMENT ON COLUMN case_steps.step_number    IS '步骤编号（从 1 开始）';
COMMENT ON COLUMN case_steps.title          IS '步骤标题，如"绘制图纸 & 建模"';
COMMENT ON COLUMN case_steps.description    IS '步骤详细描述';
COMMENT ON COLUMN case_steps.image_url      IS '步骤配图';

-- ============================================================
-- 12. case_resources — 数字资源文件
-- ============================================================
CREATE TABLE case_resources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('digital_file', 'firmware')),
  name          text NOT NULL,
  description   text,
  file_format   text,
  file_url      text,
  file_size     bigint DEFAULT 0
);

COMMENT ON TABLE  case_resources                IS '案例数字资源文件';
COMMENT ON COLUMN case_resources.id             IS '资源 ID';
COMMENT ON COLUMN case_resources.case_id        IS '所属案例';
COMMENT ON COLUMN case_resources.resource_type  IS '资源类型：digital_file=数字文件 / firmware=固件';
COMMENT ON COLUMN case_resources.name           IS '资源名称，如"外壳激光切割矢量图"';
COMMENT ON COLUMN case_resources.description    IS '说明，如"适用于CO2激光切割机导入"';
COMMENT ON COLUMN case_resources.file_format    IS '文件格式，如 .svg / .dxf';
COMMENT ON COLUMN case_resources.file_url       IS '文件下载地址（Supabase Storage）';
COMMENT ON COLUMN case_resources.file_size      IS '文件大小（字节）';

-- ============================================================
-- 13. case_dev_logs — 开发日志
-- ============================================================
CREATE TABLE case_dev_logs (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id   uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  log_type  text NOT NULL CHECK (log_type IN ('update', 'feature', 'fix')),
  content   text NOT NULL,
  logged_at date NOT NULL DEFAULT CURRENT_DATE
);

COMMENT ON TABLE  case_dev_logs            IS '案例开发日志';
COMMENT ON COLUMN case_dev_logs.id         IS '日志 ID';
COMMENT ON COLUMN case_dev_logs.case_id    IS '所属案例';
COMMENT ON COLUMN case_dev_logs.log_type   IS '日志类型：update=更新 / feature=新功能 / fix=修复';
COMMENT ON COLUMN case_dev_logs.content    IS '日志内容';
COMMENT ON COLUMN case_dev_logs.logged_at  IS '日志日期';

-- ============================================================
-- 14. comments — 评论（案例/商品通用）
-- ============================================================
CREATE TABLE comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('case', 'product')),
  target_id   uuid NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  comments               IS '评论（多态关联案例或商品）';
COMMENT ON COLUMN comments.id            IS '评论 ID';
COMMENT ON COLUMN comments.user_id       IS '评论者';
COMMENT ON COLUMN comments.target_type   IS '评论对象类型：case=案例 / product=商品';
COMMENT ON COLUMN comments.target_id     IS '评论对象 ID（案例或商品的 UUID）';
COMMENT ON COLUMN comments.content       IS '评论内容';
COMMENT ON COLUMN comments.created_at    IS '发表时间';

-- ============================================================
-- 15. favorites — 收藏
-- ============================================================
CREATE TABLE favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('case', 'product')),
  target_id   uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

COMMENT ON TABLE  favorites               IS '收藏（案例或商品）';
COMMENT ON COLUMN favorites.id            IS '收藏 ID';
COMMENT ON COLUMN favorites.user_id       IS '收藏者';
COMMENT ON COLUMN favorites.target_type   IS '收藏对象类型：case / product';
COMMENT ON COLUMN favorites.target_id     IS '收藏对象 ID';
COMMENT ON COLUMN favorites.created_at    IS '收藏时间';

-- ============================================================
-- 16. view_history — 浏览记录
-- ============================================================
CREATE TABLE view_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('case', 'product')),
  target_id   uuid NOT NULL,
  viewed_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  view_history              IS '浏览记录';
COMMENT ON COLUMN view_history.id           IS '记录 ID';
COMMENT ON COLUMN view_history.user_id      IS '浏览者';
COMMENT ON COLUMN view_history.target_type  IS '浏览对象类型：case / product';
COMMENT ON COLUMN view_history.target_id    IS '浏览对象 ID';
COMMENT ON COLUMN view_history.viewed_at    IS '浏览时间';

-- ============================================================
-- 17. cart_items — 购物车
-- ============================================================
CREATE TABLE cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

COMMENT ON TABLE  cart_items              IS '购物车';
COMMENT ON COLUMN cart_items.id           IS '购物车项 ID';
COMMENT ON COLUMN cart_items.user_id      IS '用户';
COMMENT ON COLUMN cart_items.product_id   IS '商品';
COMMENT ON COLUMN cart_items.quantity     IS '数量';
COMMENT ON COLUMN cart_items.added_at     IS '加入时间';

-- ============================================================
-- 18. orders — 订单
-- ============================================================
CREATE TABLE orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_number  text UNIQUE NOT NULL,
  total_amount  numeric(10,2) NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  orders                IS '订单';
COMMENT ON COLUMN orders.id             IS '订单 ID';
COMMENT ON COLUMN orders.user_id        IS '下单用户';
COMMENT ON COLUMN orders.order_number   IS '订单编号（唯一）';
COMMENT ON COLUMN orders.total_amount   IS '订单总金额';
COMMENT ON COLUMN orders.status         IS '状态：pending=待付款 / paid=已付款 / shipped=已发货 / completed=已完成 / cancelled=已取消';
COMMENT ON COLUMN orders.created_at     IS '下单时间';
COMMENT ON COLUMN orders.updated_at     IS '更新时间';

-- ============================================================
-- 19. order_items — 订单明细
-- ============================================================
CREATE TABLE order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    int NOT NULL DEFAULT 1,
  unit_price  numeric(10,2) NOT NULL,
  subtotal    numeric(10,2) NOT NULL
);

COMMENT ON TABLE  order_items              IS '订单明细';
COMMENT ON COLUMN order_items.id           IS '明细 ID';
COMMENT ON COLUMN order_items.order_id     IS '所属订单';
COMMENT ON COLUMN order_items.product_id   IS '商品';
COMMENT ON COLUMN order_items.quantity     IS '购买数量';
COMMENT ON COLUMN order_items.unit_price   IS '下单时单价（快照）';
COMMENT ON COLUMN order_items.subtotal     IS '小计金额';
