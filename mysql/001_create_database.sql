-- ToyLab MySQL 数据库初始化
CREATE DATABASE IF NOT EXISTS toylab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE toylab;

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  nickname VARCHAR(100) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  avatar_color VARCHAR(20) DEFAULT '#7C3AED',
  bio TEXT DEFAULT NULL,
  role ENUM('user','creator','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB COMMENT='用户表';

-- ============================================================
-- 商品分类表
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT NULL,
  parent_id BIGINT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_categories_parent (parent_id),
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB COMMENT='商品分类';

-- ============================================================
-- 商品表
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  category_id BIGINT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  spec VARCHAR(500) DEFAULT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  cover_url VARCHAR(500) DEFAULT NULL,
  model_3d_url VARCHAR(500) DEFAULT NULL,
  stock_status ENUM('in_stock','out_of_stock','pre_order') DEFAULT 'in_stock',
  sales_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_products_category (category_id),
  INDEX idx_products_slug (slug)
) ENGINE=InnoDB COMMENT='商品';

-- ============================================================
-- 商品图片表
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='商品图片';

-- ============================================================
-- 案例表
-- ============================================================
CREATE TABLE IF NOT EXISTS cases_ (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  cover_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  difficulty VARCHAR(50) DEFAULT NULL,
  estimated_time VARCHAR(50) DEFAULT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  creator_id CHAR(36) NOT NULL,
  view_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cases_creator (creator_id),
  INDEX idx_cases_slug (slug),
  INDEX idx_cases_published (is_published)
) ENGINE=InnoDB COMMENT='案例';

-- ============================================================
-- 案例物料清单
-- ============================================================
CREATE TABLE IF NOT EXISTS case_bom_items (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  case_id CHAR(36) NOT NULL,
  item_type ENUM('device','material','electronic','mechanical') DEFAULT 'electronic',
  name VARCHAR(200) NOT NULL,
  spec VARCHAR(500) DEFAULT NULL,
  unit_price DECIMAL(10,2) DEFAULT 0.00,
  required_qty INT DEFAULT 1,
  doc_url VARCHAR(500) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  product_id CHAR(36) DEFAULT NULL,
  FOREIGN KEY (case_id) REFERENCES cases_(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_bom_case (case_id)
) ENGINE=InnoDB COMMENT='案例物料清单';

-- ============================================================
-- 案例制作步骤
-- ============================================================
CREATE TABLE IF NOT EXISTS case_steps (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  case_id CHAR(36) NOT NULL,
  step_number INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  duration_minutes INT DEFAULT NULL,
  FOREIGN KEY (case_id) REFERENCES cases_(id) ON DELETE CASCADE,
  INDEX idx_steps_case (case_id)
) ENGINE=InnoDB COMMENT='案例制作步骤';

-- ============================================================
-- 案例数字资源
-- ============================================================
CREATE TABLE IF NOT EXISTS case_resources (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  case_id CHAR(36) NOT NULL,
  resource_type VARCHAR(50) DEFAULT 'file',
  name VARCHAR(200) NOT NULL,
  file_url VARCHAR(500) DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (case_id) REFERENCES cases_(id) ON DELETE CASCADE,
  INDEX idx_resources_case (case_id)
) ENGINE=InnoDB COMMENT='案例数字资源';

-- ============================================================
-- 案例开发日志
-- ============================================================
CREATE TABLE IF NOT EXISTS case_dev_logs (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  case_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT DEFAULT NULL,
  log_date DATE NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (case_id) REFERENCES cases_(id) ON DELETE CASCADE,
  INDEX idx_devlogs_case (case_id)
) ENGINE=InnoDB COMMENT='案例开发日志';

-- ============================================================
-- 评论表
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  target_type ENUM('case','product') NOT NULL,
  target_id CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_comments_target (target_type, target_id)
) ENGINE=InnoDB COMMENT='评论';

-- ============================================================
-- 收藏表
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  target_type ENUM('case','product') NOT NULL,
  target_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_favorites (user_id, target_type, target_id),
  INDEX idx_favorites_target (target_type, target_id)
) ENGINE=InnoDB COMMENT='收藏';

-- ============================================================
-- 项目表
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  cover_url VARCHAR(500) DEFAULT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_projects_user (user_id)
) ENGINE=InnoDB COMMENT='项目';

-- ============================================================
-- 用户零件库
-- ============================================================
CREATE TABLE IF NOT EXISTS user_parts (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  quantity INT DEFAULT 1,
  last_used_project VARCHAR(200) DEFAULT NULL,
  firmware_version VARCHAR(50) DEFAULT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_parts (user_id, product_id)
) ENGINE=InnoDB COMMENT='用户零件库';

-- ============================================================
-- 购物车
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_cart (user_id, product_id)
) ENGINE=InnoDB COMMENT='购物车';
