-- 为案例和商品补充占位图；若中文显示为问号，请用 mysql --default-character-set=utf8mb4 重新执行 002_seed_data.sql
USE toylab;

-- 案例封面占位图（无图时显示）
UPDATE cases_ SET cover_url = 'https://placehold.co/400x300/7C3AED/white?text=Case' WHERE cover_url IS NULL OR cover_url = '';

-- 商品封面占位图
UPDATE products SET cover_url = 'https://placehold.co/200x200/059669/white?text=Part' WHERE cover_url IS NULL OR cover_url = '';
