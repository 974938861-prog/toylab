-- 将种子用户的密码统一改为 Test123456!（与 toylab-service 使用的 bcrypt 一致）
-- 若已执行过 002_seed_data.sql 且登录报「密码错误」，执行本脚本后即可用 Test123456! 登录
USE toylab;

UPDATE users SET password_hash = '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe'
WHERE email LIKE '%@toylab.test';
