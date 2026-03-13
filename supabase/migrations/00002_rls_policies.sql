-- ============================================================
-- ToyLab Supabase 数据库迁移脚本
-- 00002_rls_policies.sql — Row Level Security 策略
-- ============================================================

-- 对所有表启用 RLS
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files     ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_parts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_bom_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_steps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_resources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_dev_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 辅助函数：判断当前用户是否是管理员
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION is_admin() IS '判断当前登录用户是否为管理员';

-- ============================================================
-- profiles — 用户资料
-- ============================================================
CREATE POLICY "任何人可查看用户资料"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "用户可更新自己的资料"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "用户注册时自动创建资料"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- product_categories — 商品分类（公开只读，管理员可写）
-- ============================================================
CREATE POLICY "任何人可查看商品分类"
  ON product_categories FOR SELECT
  USING (true);

CREATE POLICY "管理员可管理商品分类"
  ON product_categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- products — 商品（已发布的公开可读，管理员可写）
-- ============================================================
CREATE POLICY "任何人可查看已发布商品"
  ON products FOR SELECT
  USING (is_published = true OR is_admin());

CREATE POLICY "管理员可管理商品"
  ON products FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- product_images — 商品图片（跟随商品权限）
-- ============================================================
CREATE POLICY "任何人可查看商品图片"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "管理员可管理商品图片"
  ON product_images FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- projects — 用户项目（只有本人可读写）
-- ============================================================
CREATE POLICY "用户可查看自己的项目"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可创建项目"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的项目"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的项目"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- project_files — 项目文件（跟随项目权限）
-- ============================================================
CREATE POLICY "用户可查看自己项目的文件"
  ON project_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "用户可管理自己项目的文件"
  ON project_files FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.user_id = auth.uid()
  ));

-- ============================================================
-- project_modules — 画布模块（跟随项目权限）
-- ============================================================
CREATE POLICY "用户可查看自己项目的模块"
  ON project_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_modules.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "用户可管理自己项目的模块"
  ON project_modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_modules.project_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_modules.project_id AND projects.user_id = auth.uid()
  ));

-- ============================================================
-- user_parts — 用户零件库（只有本人可读写）
-- ============================================================
CREATE POLICY "用户可查看自己的零件库"
  ON user_parts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可管理自己的零件库"
  ON user_parts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- cases — 灵感案例（已发布的公开可读，创作者可管理自己的）
-- ============================================================
CREATE POLICY "任何人可查看已发布案例"
  ON cases FOR SELECT
  USING (is_published = true OR auth.uid() = creator_id OR is_admin());

CREATE POLICY "创作者可创建案例"
  ON cases FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "创作者可更新自己的案例"
  ON cases FOR UPDATE
  USING (auth.uid() = creator_id OR is_admin())
  WITH CHECK (auth.uid() = creator_id OR is_admin());

CREATE POLICY "创作者可删除自己的案例"
  ON cases FOR DELETE
  USING (auth.uid() = creator_id OR is_admin());

-- ============================================================
-- case_bom_items — 物料清单（跟随案例权限）
-- ============================================================
CREATE POLICY "任何人可查看已发布案例的BOM"
  ON case_bom_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_bom_items.case_id
      AND (cases.is_published = true OR cases.creator_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "创作者可管理自己案例的BOM"
  ON case_bom_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_bom_items.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_bom_items.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ));

-- ============================================================
-- case_steps — 制作步骤（跟随案例权限）
-- ============================================================
CREATE POLICY "任何人可查看已发布案例的步骤"
  ON case_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_steps.case_id
      AND (cases.is_published = true OR cases.creator_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "创作者可管理自己案例的步骤"
  ON case_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_steps.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_steps.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ));

-- ============================================================
-- case_resources — 数字资源（跟随案例权限）
-- ============================================================
CREATE POLICY "任何人可查看已发布案例的资源"
  ON case_resources FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_resources.case_id
      AND (cases.is_published = true OR cases.creator_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "创作者可管理自己案例的资源"
  ON case_resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_resources.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_resources.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ));

-- ============================================================
-- case_dev_logs — 开发日志（跟随案例权限）
-- ============================================================
CREATE POLICY "任何人可查看已发布案例的开发日志"
  ON case_dev_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_dev_logs.case_id
      AND (cases.is_published = true OR cases.creator_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "创作者可管理自己案例的开发日志"
  ON case_dev_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_dev_logs.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM cases WHERE cases.id = case_dev_logs.case_id
      AND (cases.creator_id = auth.uid() OR is_admin())
  ));

-- ============================================================
-- comments — 评论（公开可读，登录用户可发表，只能删自己的）
-- ============================================================
CREATE POLICY "任何人可查看评论"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "登录用户可发表评论"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的评论"
  ON comments FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- favorites — 收藏（只有本人可读写）
-- ============================================================
CREATE POLICY "用户可查看自己的收藏"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可添加收藏"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可取消收藏"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- view_history — 浏览记录（只有本人可读写）
-- ============================================================
CREATE POLICY "用户可查看自己的浏览记录"
  ON view_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可添加浏览记录"
  ON view_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的浏览记录"
  ON view_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- cart_items — 购物车（只有本人可读写）
-- ============================================================
CREATE POLICY "用户可查看自己的购物车"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可管理自己的购物车"
  ON cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- orders — 订单（只有本人可读，管理员可读所有）
-- ============================================================
CREATE POLICY "用户可查看自己的订单"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "用户可创建订单"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可更新订单状态"
  ON orders FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- order_items — 订单明细（跟随订单权限）
-- ============================================================
CREATE POLICY "用户可查看自己订单的明细"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "用户可创建订单明细"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  ));
