-- ============================================================
-- ToyLab Supabase 数据库迁移脚本
-- 00004_indexes_and_storage.sql — 索引 & Storage Bucket
-- ============================================================

-- ============================================================
-- 索引：提升查询性能
-- ============================================================

-- profiles
CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_role     ON profiles (role);

-- products
CREATE INDEX idx_products_category    ON products (category_id);
CREATE INDEX idx_products_slug        ON products (slug);
CREATE INDEX idx_products_module_type ON products (module_type);
CREATE INDEX idx_products_published   ON products (is_published) WHERE is_published = true;
CREATE INDEX idx_products_price       ON products (price);

-- product_images
CREATE INDEX idx_product_images_product ON product_images (product_id);

-- projects
CREATE INDEX idx_projects_user       ON projects (user_id);
CREATE INDEX idx_projects_updated_at ON projects (updated_at DESC);

-- project_files
CREATE INDEX idx_project_files_project ON project_files (project_id);

-- project_modules
CREATE INDEX idx_project_modules_project ON project_modules (project_id);

-- user_parts
CREATE INDEX idx_user_parts_user    ON user_parts (user_id);
CREATE INDEX idx_user_parts_product ON user_parts (product_id);

-- cases
CREATE INDEX idx_cases_creator      ON cases (creator_id);
CREATE INDEX idx_cases_category     ON cases (category);
CREATE INDEX idx_cases_published    ON cases (is_published) WHERE is_published = true;
CREATE INDEX idx_cases_view_count   ON cases (view_count DESC);
CREATE INDEX idx_cases_created_at   ON cases (created_at DESC);

-- case_bom_items
CREATE INDEX idx_case_bom_items_case ON case_bom_items (case_id);

-- case_steps
CREATE INDEX idx_case_steps_case ON case_steps (case_id);

-- case_resources
CREATE INDEX idx_case_resources_case ON case_resources (case_id);

-- case_dev_logs
CREATE INDEX idx_case_dev_logs_case ON case_dev_logs (case_id);

-- comments（多态查询需要复合索引）
CREATE INDEX idx_comments_target ON comments (target_type, target_id);
CREATE INDEX idx_comments_user   ON comments (user_id);
CREATE INDEX idx_comments_time   ON comments (created_at DESC);

-- favorites（多态查询）
CREATE INDEX idx_favorites_target ON favorites (target_type, target_id);
CREATE INDEX idx_favorites_user   ON favorites (user_id);

-- view_history
CREATE INDEX idx_view_history_user   ON view_history (user_id);
CREATE INDEX idx_view_history_target ON view_history (target_type, target_id);
CREATE INDEX idx_view_history_time   ON view_history (viewed_at DESC);

-- cart_items
CREATE INDEX idx_cart_items_user ON cart_items (user_id);

-- orders
CREATE INDEX idx_orders_user    ON orders (user_id);
CREATE INDEX idx_orders_status  ON orders (status);
CREATE INDEX idx_orders_time    ON orders (created_at DESC);

-- order_items
CREATE INDEX idx_order_items_order ON order_items (order_id);

-- ============================================================
-- Supabase Storage Buckets
-- ============================================================
-- 注意：以下 SQL 仅在 Supabase 平台环境下生效
-- 如果在 Supabase Dashboard 中手动创建 Bucket，可跳过此部分

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('case-covers',    'case-covers',    true),
  ('case-resources', 'case-resources', false),
  ('project-files',  'project-files',  false),
  ('avatars',        'avatars',        true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS：商品图片和案例封面可公开读取
CREATE POLICY "公开读取商品图片"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "公开读取案例封面"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-covers');

CREATE POLICY "公开读取头像"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 登录用户可上传头像到自己的目录
CREATE POLICY "用户可上传头像"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 管理员可上传商品图片
CREATE POLICY "管理员可上传商品图片"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND is_admin()
  );

-- 创作者可上传案例封面和资源
CREATE POLICY "创作者可上传案例文件"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('case-covers', 'case-resources')
    AND auth.uid() IS NOT NULL
  );

-- 用户可上传项目文件到自己的目录
CREATE POLICY "用户可上传项目文件"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 用户可读取自己目录下的项目文件和案例资源
CREATE POLICY "用户可读取自己的项目文件"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "登录用户可读取案例资源"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-resources'
    AND auth.uid() IS NOT NULL
  );
