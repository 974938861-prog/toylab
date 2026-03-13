-- ============================================================
-- ToyLab Supabase 数据库迁移脚本
-- 00003_triggers_and_functions.sql — 触发器 & 函数
-- ============================================================

-- ============================================================
-- 1. 用户注册时自动创建 profiles 记录
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_color, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    '#' || LPAD(TO_HEX((RANDOM() * 16777215)::int), 6, '0'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_user() IS '用户注册时自动创建 profiles 记录，从 auth metadata 提取用户名';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. 通用 updated_at 自动更新触发器
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at() IS '自动更新 updated_at 字段为当前时间';

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_project_files_updated_at ON project_files;
CREATE TRIGGER set_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_cases_updated_at ON cases;
CREATE TRIGGER set_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. 订单编号自动生成
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number = 'TL' || TO_CHAR(now(), 'YYYYMMDD') || '-' ||
                       LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION generate_order_number() IS '自动生成订单编号，格式：TL20260310-123456';

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- 4. 收藏计数（可选：用于在案例/商品上维护收藏数）
-- ============================================================
CREATE OR REPLACE FUNCTION update_view_count(
  p_target_type text,
  p_target_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF p_target_type = 'case' THEN
    UPDATE cases SET view_count = view_count + 1 WHERE id = p_target_id;
  ELSIF p_target_type = 'product' THEN
    UPDATE products SET view_count = view_count + 1 WHERE id = p_target_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION update_view_count(text, uuid) IS '增加浏览计数（案例或商品），由客户端调用';
