-- ============================================================
-- ToyLab Supabase 数据库迁移脚本
-- 00005_seed_data.sql — 种子数据（前端原型中的所有硬编码数据）
-- ============================================================
-- 此脚本会先往 auth.users 插入测试用户，再插入 profiles 及关联数据
-- 在生产环境中不应执行此文件
-- ============================================================

DO $$
DECLARE
  uid_toylab   uuid := 'a0000000-0000-0000-0000-000000000001';
  uid_makerlab uuid := 'a0000000-0000-0000-0000-000000000002';
  uid_robokids uuid := 'a0000000-0000-0000-0000-000000000003';
  uid_lightwave uuid := 'a0000000-0000-0000-0000-000000000004';
  uid_weathermaker uuid := 'a0000000-0000-0000-0000-000000000005';
  uid_notebot  uuid := 'a0000000-0000-0000-0000-000000000006';
  uid_makerlin uuid := 'a0000000-0000-0000-0000-000000000007';
  uid_aibuilder uuid := 'a0000000-0000-0000-0000-000000000008';
  uid_gearfan  uuid := 'a0000000-0000-0000-0000-000000000009';

  -- 商品 UUID
  pid_push_switch  uuid := 'b0000000-0000-0000-0000-000000000001';
  pid_ir_sensor    uuid := 'b0000000-0000-0000-0000-000000000002';
  pid_speaker      uuid := 'b0000000-0000-0000-0000-000000000003';
  pid_mic          uuid := 'b0000000-0000-0000-0000-000000000004';
  pid_dc_motor     uuid := 'b0000000-0000-0000-0000-000000000005';
  pid_battery_box  uuid := 'b0000000-0000-0000-0000-000000000006';
  pid_led          uuid := 'b0000000-0000-0000-0000-000000000007';
  pid_wire         uuid := 'b0000000-0000-0000-0000-000000000008';
  pid_esp32        uuid := 'b0000000-0000-0000-0000-000000000009';
  pid_battery_lipo uuid := 'b0000000-0000-0000-0000-000000000010';
  pid_dht11        uuid := 'b0000000-0000-0000-0000-000000000011';
  pid_rgb_led      uuid := 'b0000000-0000-0000-0000-000000000012';
  pid_button_sw    uuid := 'b0000000-0000-0000-0000-000000000013';
  pid_gear_m1      uuid := 'b0000000-0000-0000-0000-000000000014';
  pid_tire_65      uuid := 'b0000000-0000-0000-0000-000000000015';
  pid_bearing_608  uuid := 'b0000000-0000-0000-0000-000000000016';
  pid_spring       uuid := 'b0000000-0000-0000-0000-000000000017';
  pid_shaft_d5     uuid := 'b0000000-0000-0000-0000-000000000018';
  pid_mcu_board    uuid := 'b0000000-0000-0000-0000-000000000019';

  -- 案例 UUID
  cid_electro_bean uuid := 'c0000000-0000-0000-0000-000000000001';
  cid_luka_dog     uuid := 'c0000000-0000-0000-0000-000000000002';
  cid_moto_rocker  uuid := 'c0000000-0000-0000-0000-000000000003';
  cid_desk_lamp    uuid := 'c0000000-0000-0000-0000-000000000004';
  cid_weather      uuid := 'c0000000-0000-0000-0000-000000000005';
  cid_piano        uuid := 'c0000000-0000-0000-0000-000000000006';
  cid_racer        uuid := 'c0000000-0000-0000-0000-000000000007';

  -- 项目 UUID
  pjid_car     uuid := 'd0000000-0000-0000-0000-000000000001';
  pjid_lamp    uuid := 'd0000000-0000-0000-0000-000000000002';
  pjid_weather uuid := 'd0000000-0000-0000-0000-000000000003';

BEGIN

-- ============================================================
-- 1. 插入测试用户到 auth.users（密码统一为 Test123456!）
-- ============================================================
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data, is_super_admin)
VALUES
  (uid_toylab,       '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'toylab@toylab.test',       crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"ToyLab 官方"}'::jsonb,       false),
  (uid_makerlab,     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'makerlab@toylab.test',     crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"MakerLab"}'::jsonb,           false),
  (uid_robokids,     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'robokids@toylab.test',     crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"RoboKids"}'::jsonb,           false),
  (uid_lightwave,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lightwave@toylab.test',    crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"LightWave"}'::jsonb,          false),
  (uid_weathermaker, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'weathermaker@toylab.test', crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"WeatherMaker"}'::jsonb,       false),
  (uid_notebot,      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'notebot@toylab.test',      crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"NoteBot"}'::jsonb,            false),
  (uid_makerlin,     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'makerlin@toylab.test',     crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"MakerLin"}'::jsonb,           false),
  (uid_aibuilder,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aibuilder@toylab.test',    crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"AIBuilder"}'::jsonb,          false),
  (uid_gearfan,      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gearfan@toylab.test',      crypt('Test123456!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"GearFan"}'::jsonb,            false)
ON CONFLICT (id) DO NOTHING;

-- 同步插入 auth.identities（Supabase Auth 要求）
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (uid_toylab,       uid_toylab,       uid_toylab::text,       json_build_object('sub', uid_toylab::text,       'email', 'toylab@toylab.test')::jsonb,       'email', now(), now(), now()),
  (uid_makerlab,     uid_makerlab,     uid_makerlab::text,     json_build_object('sub', uid_makerlab::text,     'email', 'makerlab@toylab.test')::jsonb,     'email', now(), now(), now()),
  (uid_robokids,     uid_robokids,     uid_robokids::text,     json_build_object('sub', uid_robokids::text,     'email', 'robokids@toylab.test')::jsonb,     'email', now(), now(), now()),
  (uid_lightwave,    uid_lightwave,    uid_lightwave::text,    json_build_object('sub', uid_lightwave::text,    'email', 'lightwave@toylab.test')::jsonb,    'email', now(), now(), now()),
  (uid_weathermaker, uid_weathermaker, uid_weathermaker::text, json_build_object('sub', uid_weathermaker::text, 'email', 'weathermaker@toylab.test')::jsonb, 'email', now(), now(), now()),
  (uid_notebot,      uid_notebot,      uid_notebot::text,      json_build_object('sub', uid_notebot::text,      'email', 'notebot@toylab.test')::jsonb,      'email', now(), now(), now()),
  (uid_makerlin,     uid_makerlin,     uid_makerlin::text,     json_build_object('sub', uid_makerlin::text,     'email', 'makerlin@toylab.test')::jsonb,     'email', now(), now(), now()),
  (uid_aibuilder,    uid_aibuilder,    uid_aibuilder::text,    json_build_object('sub', uid_aibuilder::text,    'email', 'aibuilder@toylab.test')::jsonb,    'email', now(), now(), now()),
  (uid_gearfan,      uid_gearfan,      uid_gearfan::text,      json_build_object('sub', uid_gearfan::text,      'email', 'gearfan@toylab.test')::jsonb,      'email', now(), now(), now())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. 插入 profiles（触发器可能已自动创建，用 ON CONFLICT 兜底）
-- ============================================================
INSERT INTO profiles (id, username, avatar_color, role) VALUES
  (uid_toylab,       'ToyLab 官方',    '#7C3AED', 'creator'),
  (uid_makerlab,     'MakerLab',       '#059669', 'creator'),
  (uid_robokids,     'RoboKids',       '#DC2626', 'creator'),
  (uid_lightwave,    'LightWave',      '#D97706', 'creator'),
  (uid_weathermaker, 'WeatherMaker',   '#0284C7', 'creator'),
  (uid_notebot,      'NoteBot',        '#BE185D', 'creator'),
  (uid_makerlin,     'MakerLin',       '#0284C7', 'user'),
  (uid_aibuilder,    'AIBuilder',      '#BE185D', 'user'),
  (uid_gearfan,      'GearFan',        '#059669', 'user')
ON CONFLICT (id) DO UPDATE SET
  username     = EXCLUDED.username,
  avatar_color = EXCLUDED.avatar_color,
  role         = EXCLUDED.role;

-- ============================================================
-- 3. 商品分类（先清理残留数据，再插入）
-- ============================================================
DELETE FROM product_categories WHERE slug IN ('electronics','mechanical','input','output','motor','power','mcu','wire','gear','pulley','bearing','spring','shaft','screw','hinge','tire');
ALTER SEQUENCE IF EXISTS product_categories_id_seq RESTART;

INSERT INTO product_categories (parent_id, name, slug, sort_order) VALUES
  (NULL, '全部电子模块', 'electronics', 1),
  (NULL, '全部机械配件', 'mechanical',  2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_categories (parent_id, name, slug, sort_order) VALUES
  ((SELECT id FROM product_categories WHERE slug = 'electronics'), '输入模块', 'input',  1),
  ((SELECT id FROM product_categories WHERE slug = 'electronics'), '输出模块', 'output', 2),
  ((SELECT id FROM product_categories WHERE slug = 'electronics'), '动力模块', 'motor',  3),
  ((SELECT id FROM product_categories WHERE slug = 'electronics'), '电源模块', 'power',  4),
  ((SELECT id FROM product_categories WHERE slug = 'electronics'), '主控模块', 'mcu',    5),
  ((SELECT id FROM product_categories WHERE slug = 'electronics'), '线束',    'wire',   6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_categories (parent_id, name, slug, sort_order) VALUES
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '齿轮', 'gear',    1),
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '带轮', 'pulley',  2),
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '轴承', 'bearing', 3),
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '弹簧', 'spring',  4),
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '轴',   'shaft',   5),
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '螺丝', 'screw',   6),
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '合页', 'hinge',   7),
  ((SELECT id FROM product_categories WHERE slug = 'mechanical'), '轮胎', 'tire',    8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. 商品（通过 slug 子查询动态关联分类，不再硬编码 ID）
-- ============================================================
INSERT INTO products (id, category_id, name, slug, spec, price, stock, stock_status, module_type, cover_url, sales_count, view_count) VALUES
  (pid_push_switch, (SELECT id FROM product_categories WHERE slug='input'),  '手按开关',       'push-switch',    '16x16 · 4PIN · 磁吸',       3,  200, 'in_stock',   'input',  'push-switch.png',    1203, 8456),
  (pid_ir_sensor,   (SELECT id FROM product_categories WHERE slug='input'),  '红外距离传感器', 'ir-sensor',      '16x16 · 4PIN · 磁吸',       3,  150, 'in_stock',   'input',  'ir-sensor.png',      2891, 12034),
  (pid_speaker,     (SELECT id FROM product_categories WHERE slug='output'), '喇叭',           'speaker',        '16x16 · 4PIN · 磁吸',       3,  180, 'in_stock',   'output', 'speaker.png',        3542, 15287),
  (pid_mic,         (SELECT id FROM product_categories WHERE slug='input'),  '麦克风',         'microphone',     '16x16 · 4PIN · 磁吸',       3,  120, 'in_stock',   'input',  'mic.png',            4102, 18963),
  (pid_dc_motor,    (SELECT id FROM product_categories WHERE slug='motor'),  '130有刷电机',    'dc-motor-130',   '32x32 · 4PIN · 磁吸',       4,  100, 'in_stock',   'motor',  'dc-motor.png',       892,  5671),
  (pid_battery_box, (SELECT id FROM product_categories WHERE slug='power'),  '电池盒',         'battery-box',    '64x32 · 4PIN · 磁吸',       5,  80,  'in_stock',   'power',  'battery-box.png',    567,  4238),
  (pid_led,         (SELECT id FROM product_categories WHERE slug='output'), 'LED灯',          'led-light',      '16x16 · 4PIN · 磁吸',       3,  300, 'in_stock',   'output', 'led-light.png',      1456, 7123),
  (pid_wire,        (SELECT id FROM product_categories WHERE slug='wire'),   '磁吸线',         'mag-wire',       '12cm · 4PIN · 磁吸',        1,  500, 'in_stock',   'wire',   'wire-cables.png',    324,  2891)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, category_id, name, slug, spec, price, stock, stock_status, module_type, firmware_ver, sales_count, view_count) VALUES
  (pid_esp32,        (SELECT id FROM product_categories WHERE slug='mcu'),    'ESP32 主控',           'esp32-mcu',       '双核 240MHz · WiFi 蓝牙',        35, 50,  'in_stock',   'mcu',   'v2.1.3', 500, 3000),
  (pid_battery_lipo, (SELECT id FROM product_categories WHERE slug='power'),  '锂聚合物电池21700',     'lipo-21700',      '21700 · 3000mAh · JST 接口',     18, 60,  'in_stock',   'power',  NULL,    400, 2500),
  (pid_rgb_led,      (SELECT id FROM product_categories WHERE slug='output'), 'RGB LED 灯',           'rgb-led',         '可编程 · PWM调光 · 共3引脚',      3,  200, 'in_stock',   'output', NULL,    800, 5000),
  (pid_button_sw,    (SELECT id FROM product_categories WHERE slug='input'),  '按键开关',              'button-switch',   '轻触触发 · 防抖处理 · 2引脚',     2,  300, 'in_stock',   'input',  NULL,    600, 4000),
  (pid_dht11,        (SELECT id FROM product_categories WHERE slug='input'),  '温湿度传感器 DHT11',    'dht11',           '0~50C · 20~90%RH · 数字信号',    5,  100, 'in_stock',   'input',  'v1.0.2',300, 2000),
  (pid_mcu_board,    (SELECT id FROM product_categories WHERE slug='mcu'),    '主控板',               'mcu-board',       'ESP32-S3 · 240MHz · Wi-Fi + BLE', 35, 30,  'in_stock',   'mcu',    NULL,    200, 1500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, category_id, name, slug, spec, price, stock, stock_status, module_type, sales_count, view_count) VALUES
  (pid_gear_m1,     (SELECT id FROM product_categories WHERE slug='gear'),    '标准齿轮M1',      'gear-m1-20t',     'M1 模数 · 20齿 · POM 材质',         2,  200, 'in_stock',   'gear',    300, 1800),
  (pid_tire_65,     (SELECT id FROM product_categories WHERE slug='tire'),    '橡胶轮胎 65mm',    'rubber-tire-65',  '径65mm · 宽26mm · 防滑纹路',        4,  150, 'in_stock',   'tire',    250, 1600),
  (pid_bearing_608, (SELECT id FROM product_categories WHERE slug='bearing'), '滚珠轴承608',      'bearing-608zz',   '608ZZ 内径 8mm 外径 22mm',          3,  300, 'in_stock',   'bearing', 400, 2200),
  (pid_spring,      (SELECT id FROM product_categories WHERE slug='spring'),  '压缩弹簧',         'compression-spring','径 0.5mm · 外径 8mm · 自由长30mm', 1,  500, 'in_stock',   'spring',  150, 900),
  (pid_shaft_d5,    (SELECT id FROM product_categories WHERE slug='shaft'),   '不锈钢轴 D5',      'steel-shaft-d5',  '径5mm · 长100mm · 304 不锈钢',     3,  200, 'in_stock',   'shaft',   180, 1100)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. 灵感案例
-- ============================================================
INSERT INTO cases (id, creator_id, title, summary, category, cover_url, estimated_time, price, view_count, purchase_count, designer_story) VALUES
  (cid_electro_bean, uid_toylab,       'Electro-Bean',        '一款使用亚克力做外壳的儿童DIY乐器', 'game',      'electro-bean-3d.png', '1h', 0,  6891, 1234,
   '做这个项目是因为想给孩子一个能自己动手做的玩具。我花了三个月时间，从第一版用纸板做的原型到现在这个亚克力版本，每一个按键的音阶都是亲手调的。'),
  (cid_luka_dog,     uid_makerlab,     '小狗鲁卡机器人',      NULL,                              'pet',       'luka-dog.png',        NULL, 12, 1847, 324,  NULL),
  (cid_moto_rocker,  uid_robokids,     'Moto-Rocker',         NULL,                              'car',       'moto-rocker.png',     NULL, 0,  5102, 1203, NULL),
  (cid_desk_lamp,    uid_lightwave,    'Polaris Kids Desk Lamp', NULL,                           'appliance', 'wooden-car.png',      NULL, 8,  987,  156,  NULL),
  (cid_weather,      uid_weathermaker, '气象站数据采集器',     NULL,                              'tool',      'tilt-speaker.png',    NULL, 0,  4218, 763,  NULL),
  (cid_piano,        uid_notebot,      '迷你钢琴电子琴',      NULL,                              'game',      'crystal-lamp.png',    NULL, 6,  652,  89,   NULL),
  (cid_racer,        uid_toylab,       '智能感应赛车',         NULL,                              'car',       'blue-kart.png',       NULL, 0,  6891, 1567, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. Electro-Bean 案例的 BOM 物料清单
-- ============================================================
INSERT INTO case_bom_items (case_id, product_id, item_type, name, spec, unit_price, required_qty, sort_order) VALUES
  -- 设备
  (cid_electro_bean, NULL,             'device',     'CO2 激光切割机',     '推荐 · 功率40W · 工作幅面宽大 · 幅面600x400mm', 0,  0, 1),
  -- 材料
  (cid_electro_bean, NULL,             'material',   '3mm 紫色亚克力板',   '600x300mm · 厚3mm · 激光切割用',                8,  2, 2),
  (cid_electro_bean, NULL,             'material',   '3mm 黄色亚克力板',   '600x300mm · 厚3mm · 激光切割用',                8,  2, 3),
  -- 电子模块
  (cid_electro_bean, pid_push_switch,  'module',     '手按开关',           'ToyLab 定制款 · 磁吸接口 · 3.3V',              3,  7, 4),
  (cid_electro_bean, pid_speaker,      'module',     '喇叭',              '8 ohm · 0.5W · 直径 36mm',                     5,  4, 5),
  (cid_electro_bean, pid_mcu_board,    'module',     '主控板',             'ESP32-S3 · 240MHz · Wi-Fi + BLE',              35, 1, 6),
  (cid_electro_bean, pid_battery_lipo, 'module',     '锂电池组',           '3.7V · 1200mAh · 防过放保护',                   18, 1, 7),
  (cid_electro_bean, pid_rgb_led,      'module',     'RGB LED 灯珠',      'RGB LED WS2812B · 5V · 全彩可编程',             3,  7, 8),
  -- 机械零件
  (cid_electro_bean, NULL,             'mechanical', 'M4x12mm 螺丝',     'M4 x 12mm · 内六角 · 304不锈钢',               1,  4, 9);

-- ============================================================
-- 6. Electro-Bean 制作步骤
-- ============================================================
INSERT INTO case_steps (case_id, step_number, title, description) VALUES
  (cid_electro_bean, 1, '绘制图纸 & 建模',   '使用 ToyLab 完成外壳建模与激光切割路径规划'),
  (cid_electro_bean, 2, '激光切割加工',       '导入矢量文件，用CO2激光机切割亚克力面板与外壳件'),
  (cid_electro_bean, 3, '拼装组合',           '按结构图拼装外壳，使用磁吸接口连接各电子模块'),
  (cid_electro_bean, 4, '编写程序',           '在 ToyLab 工作室中用积木编程实现按键音阶控制'),
  (cid_electro_bean, 5, '调试 & 完善',        '在 ToyLab 中烧录程序并完成整体功能调试与音阶校准');

-- ============================================================
-- 7. Electro-Bean 数字资源
-- ============================================================
INSERT INTO case_resources (case_id, resource_type, name, description, file_format) VALUES
  (cid_electro_bean, 'digital_file', 'Electro-Bean 外形文件',    '外壳 & 结构件 3D 模型',       '.step / .stl'),
  (cid_electro_bean, 'digital_file', '外壳激光切割矢量图',       '适用于CO2激光切割机导入',      '.svg / .dxf'),
  (cid_electro_bean, 'digital_file', '外观装饰贴纸图案',         '外壳 & Logo 图案文件',         '.svg / .dxf'),
  (cid_electro_bean, 'firmware',     'Electro-Bean 固件',        '积木文件 & Python 源码',       '.bin / .ino');

-- ============================================================
-- 8. Electro-Bean 开发日志
-- ============================================================
INSERT INTO case_dev_logs (case_id, log_type, content, logged_at) VALUES
  (cid_electro_bean, 'update',  'v2.1 修复了音阶漂移问题，优化按键防抖与响应逻辑',   '2025-11-20'),
  (cid_electro_bean, 'feature', '新增蓝牙无线控制，支持 App 远程演奏与录音',          '2025-10-05'),
  (cid_electro_bean, 'fix',     '修复多键同按时主控崩溃的问题，提升整体稳定性',        '2025-09-12');

-- ============================================================
-- 9. Electro-Bean 评论
-- ============================================================
INSERT INTO comments (user_id, target_type, target_id, content, created_at) VALUES
  (uid_makerlin,  'case', cid_electro_bean, '这个案例太棒了！按键音效设计很巧妙，孩子非常喜欢！',           now() - INTERVAL '2 days'),
  (uid_aibuilder, 'case', cid_electro_bean, '已经做完了，喇叭音色很圆润，建议再多加几个音阶！',             now() - INTERVAL '5 days'),
  (uid_gearfan,   'case', cid_electro_bean, '外壳也可以用 PLA 3D 打印替代亚克力，效果同样不错！',          now() - INTERVAL '7 days');

-- ============================================================
-- 10. 用户项目（作品库）
-- ============================================================
INSERT INTO projects (id, user_id, name, cover_type, updated_at) VALUES
  (pjid_car,     uid_toylab, '蓝色智慧小车',   'car',    '2026-02-28'),
  (pjid_lamp,    uid_toylab, 'LED 台灯',        'led',    '2026-01-20'),
  (pjid_weather, uid_toylab, '传感器气象站',    'sensor', '2026-03-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. 用户零件库（我的电子模块 + 我的机械零件）
-- ============================================================
INSERT INTO user_parts (user_id, product_id, quantity, added_at, last_project_id, firmware_ver) VALUES
  -- 电子模块
  (uid_toylab, pid_esp32,        3,  '2025-11-20', pjid_car,     'v2.1.3'),
  (uid_toylab, pid_battery_lipo, 5,  '2025-11-20', pjid_car,     NULL),
  (uid_toylab, pid_rgb_led,      12, '2025-12-01', pjid_lamp,    NULL),
  (uid_toylab, pid_button_sw,    8,  '2025-12-01', pjid_weather, NULL),
  (uid_toylab, pid_dht11,        4,  '2026-01-08', pjid_weather, 'v1.0.2'),
  -- 机械零件
  (uid_toylab, pid_gear_m1,      6,  '2025-10-15', pjid_car,     NULL),
  (uid_toylab, pid_tire_65,      4,  '2025-10-15', pjid_car,     NULL),
  (uid_toylab, pid_bearing_608,  10, '2025-11-02', pjid_car,     NULL),
  (uid_toylab, pid_spring,       8,  '2026-01-12', NULL,          NULL),
  (uid_toylab, pid_shaft_d5,     5,  '2025-12-20', pjid_car,     NULL)
ON CONFLICT (user_id, product_id) DO NOTHING;

-- ============================================================
-- 12. 收藏示例
-- ============================================================
INSERT INTO favorites (user_id, target_type, target_id) VALUES
  (uid_toylab, 'case', cid_luka_dog),
  (uid_toylab, 'case', cid_moto_rocker),
  (uid_toylab, 'case', cid_piano)
ON CONFLICT (user_id, target_type, target_id) DO NOTHING;

END;
$$;
