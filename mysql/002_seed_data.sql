USE toylab;

-- ============================================================
-- 1. 用户（密码统一为 Test123456! 的 bcrypt 哈希，Python bcrypt 生成）
-- ============================================================
INSERT IGNORE INTO users (id, email, password_hash, username, nickname, avatar_color, role) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'toylab@toylab.test',       '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'toylab_official', 'ToyLab 官方',  '#7C3AED', 'creator'),
  ('a0000002-0000-0000-0000-000000000002', 'makerlab@toylab.test',     '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'makerlab',        'MakerLab',      '#059669', 'creator'),
  ('a0000003-0000-0000-0000-000000000003', 'robokids@toylab.test',     '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'robokids',        'RoboKids',      '#DC2626', 'creator'),
  ('a0000004-0000-0000-0000-000000000004', 'lightwave@toylab.test',    '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'lightwave',       'LightWave',     '#D97706', 'creator'),
  ('a0000005-0000-0000-0000-000000000005', 'weathermaker@toylab.test', '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'weathermaker',    'WeatherMaker',  '#0284C7', 'creator'),
  ('a0000006-0000-0000-0000-000000000006', 'notebot@toylab.test',      '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'notebot',         'NoteBot',       '#BE185D', 'creator'),
  ('a0000007-0000-0000-0000-000000000007', 'makerlin@toylab.test',     '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'makerlin',        'MakerLin',      '#0284C7', 'user'),
  ('a0000008-0000-0000-0000-000000000008', 'aibuilder@toylab.test',    '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'aibuilder',       'AIBuilder',     '#BE185D', 'user'),
  ('a0000009-0000-0000-0000-000000000009', 'gearfan@toylab.test',      '$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe', 'gearfan',         'GearFan',       '#059669', 'user');

-- ============================================================
-- 2. 商品分类
-- ============================================================
DELETE FROM product_categories;
ALTER TABLE product_categories AUTO_INCREMENT = 1;

INSERT INTO product_categories (name, slug, sort_order) VALUES
  ('全部电子模块', 'electronics', 1),
  ('全部机械配件', 'mechanical', 2);

INSERT INTO product_categories (name, slug, parent_id, sort_order) VALUES
  ('输入模块', 'input',  (SELECT id FROM (SELECT id FROM product_categories WHERE slug='electronics') t), 1),
  ('输出模块', 'output', (SELECT id FROM (SELECT id FROM product_categories WHERE slug='electronics') t), 2),
  ('动力模块', 'motor',  (SELECT id FROM (SELECT id FROM product_categories WHERE slug='electronics') t), 3),
  ('电源模块', 'power',  (SELECT id FROM (SELECT id FROM product_categories WHERE slug='electronics') t), 4),
  ('主控模块', 'mcu',    (SELECT id FROM (SELECT id FROM product_categories WHERE slug='electronics') t), 5),
  ('线束',     'wire',   (SELECT id FROM (SELECT id FROM product_categories WHERE slug='electronics') t), 6),
  ('齿轮',     'gear',    (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 1),
  ('带轮',     'pulley',  (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 2),
  ('轴承',     'bearing', (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 3),
  ('弹簧',     'spring',  (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 4),
  ('轴',       'shaft',   (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 5),
  ('螺丝',     'screw',   (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 6),
  ('合页',     'hinge',   (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 7),
  ('轮胎',     'tire',    (SELECT id FROM (SELECT id FROM product_categories WHERE slug='mechanical') t), 8);

-- ============================================================
-- 3. 商品
-- ============================================================
INSERT IGNORE INTO products (id, name, slug, category_id, spec, price, sales_count, view_count) VALUES
  ('b0000001-0000-0000-0000-000000000001', '手按开关',       'push-switch',  (SELECT id FROM product_categories WHERE slug='input'),  '16×16 · 4PIN · 磁吸', 3.00, 1203, 8456),
  ('b0000002-0000-0000-0000-000000000002', '红外距离传感器', 'ir-sensor',    (SELECT id FROM product_categories WHERE slug='input'),  '16×16 · 4PIN · 磁吸', 3.00, 2891, 12034),
  ('b0000003-0000-0000-0000-000000000003', '喇叭',           'speaker',      (SELECT id FROM product_categories WHERE slug='output'), '16×16 · 4PIN · 磁吸', 3.00, 3542, 15287),
  ('b0000004-0000-0000-0000-000000000004', '麦克风',         'mic',          (SELECT id FROM product_categories WHERE slug='input'),  '16×16 · 4PIN · 磁吸', 3.00, 4102, 18963),
  ('b0000005-0000-0000-0000-000000000005', '130有刷电机',    'dc-motor',     (SELECT id FROM product_categories WHERE slug='motor'),  '32×32 · 4PIN · 磁吸', 4.00, 892, 5671),
  ('b0000006-0000-0000-0000-000000000006', '电池盒',         'battery-box',  (SELECT id FROM product_categories WHERE slug='power'),  '64×32 · 4PIN · 磁吸', 5.00, 567, 4238),
  ('b0000007-0000-0000-0000-000000000007', 'LED灯',          'led-light',    (SELECT id FROM product_categories WHERE slug='output'), '16×16 · 4PIN · 磁吸', 3.00, 1456, 7123),
  ('b0000008-0000-0000-0000-000000000008', '磁吸线',         'wire-cable',   (SELECT id FROM product_categories WHERE slug='wire'),   '12cm · 4PIN · 磁吸',  1.00, 324, 2891),
  ('b0000009-0000-0000-0000-000000000009', 'ESP32 主控',     'esp32-mcu',    (SELECT id FROM product_categories WHERE slug='mcu'),    '双核240MHz · WiFi蓝牙', 35.00, 2156, 9872),
  ('b0000010-0000-0000-0000-000000000010', '锂聚合物电池',   'lipo-battery', (SELECT id FROM product_categories WHERE slug='power'),  '21700 · 3000mAh · JST', 18.00, 1834, 7561),
  ('b0000011-0000-0000-0000-000000000011', '温湿度传感器',   'dht11',        (SELECT id FROM product_categories WHERE slug='input'),  'DHT11 · 数字信号',     5.00, 1567, 6234),
  ('b0000012-0000-0000-0000-000000000012', 'RGB LED灯',      'rgb-led',      (SELECT id FROM product_categories WHERE slug='output'), '可编程 · PWM调光',     4.00, 2345, 8901),
  ('b0000013-0000-0000-0000-000000000013', '按键开关',       'button-switch',(SELECT id FROM product_categories WHERE slug='input'),  '轻触触发 · 防抖',      2.00, 3456, 12345),
  ('b0000014-0000-0000-0000-000000000014', '标准齿轮M1',     'gear-m1',      (SELECT id FROM product_categories WHERE slug='gear'),   'M1 · 20齿 · POM',      3.00, 890, 3456),
  ('b0000015-0000-0000-0000-000000000015', '橡胶轮胎65mm',   'tire-65',      (SELECT id FROM product_categories WHERE slug='tire'),   '径65mm · 宽26mm',      6.00, 678, 2890),
  ('b0000016-0000-0000-0000-000000000016', '滚珠轴承608',    'bearing-608',  (SELECT id FROM product_categories WHERE slug='bearing'),'608ZZ · 内径8mm',      4.00, 1234, 5678),
  ('b0000017-0000-0000-0000-000000000017', '压缩弹簧',       'spring-comp',  (SELECT id FROM product_categories WHERE slug='spring'), '径0.5mm · 外径8mm',    2.00, 567, 2345),
  ('b0000018-0000-0000-0000-000000000018', '不锈钢轴D5',     'shaft-d5',     (SELECT id FROM product_categories WHERE slug='shaft'),  '径5mm · 长100mm · 304', 5.00, 456, 1890),
  ('b0000019-0000-0000-0000-000000000019', '主控板',         'mcu-board',    (SELECT id FROM product_categories WHERE slug='mcu'),    'ToyLab 定制主控',      35.00, 3210, 14567);

-- ============================================================
-- 4. 案例
-- ============================================================
INSERT IGNORE INTO cases_ (id, title, slug, description, difficulty, estimated_time, price, is_free, is_published, creator_id, view_count, sales_count) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Electro-Bean',        'electro-bean',   '一款使用亚克力做外壳的儿童DIY乐器', '初级', '1h',  0,  TRUE,  TRUE, 'a0000001-0000-0000-0000-000000000001', 3256, 892),
  ('c0000002-0000-0000-0000-000000000002', '小狗鲁卡机器人',       'luka-dog',       '可爱的四足机器人玩具',             '中级', '2h',  12, FALSE, TRUE, 'a0000002-0000-0000-0000-000000000002', 1847, 324),
  ('c0000003-0000-0000-0000-000000000003', 'Moto-Rocker',         'moto-rocker',    '摩托车造型的摇摆玩具',             '初级', '1.5h', 0,  TRUE,  TRUE, 'a0000003-0000-0000-0000-000000000003', 5102, 1203),
  ('c0000004-0000-0000-0000-000000000004', 'Polaris Kids Desk Lamp','desk-lamp',     '极光造型儿童台灯',                '初级', '1h',  8,  FALSE, TRUE, 'a0000004-0000-0000-0000-000000000004', 987, 156),
  ('c0000005-0000-0000-0000-000000000005', '气象站数据采集器',     'weather-station', '环境温湿度光照数据采集器',         '中级', '3h',  0,  TRUE,  TRUE, 'a0000005-0000-0000-0000-000000000005', 4218, 763),
  ('c0000006-0000-0000-0000-000000000006', '迷你钢琴电子琴',       'mini-piano',     '7键电子琴玩具',                   '初级', '1h',  6,  FALSE, TRUE, 'a0000006-0000-0000-0000-000000000006', 652, 89),
  ('c0000007-0000-0000-0000-000000000007', '智能感应赛车',         'smart-racer',    '红外避障智能小车',                '高级', '4h',  0,  TRUE,  TRUE, 'a0000001-0000-0000-0000-000000000001', 6891, 1567);

-- ============================================================
-- 5. BOM (Electro-Bean)
-- ============================================================
INSERT IGNORE INTO case_bom_items (id, case_id, item_type, name, spec, unit_price, required_qty, sort_order) VALUES
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'device',     'CO2 激光切割机',     '功率40W · 幅面600×400mm', 0, 0, 1),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'material',   '3mm 紫色亚克力板',  '600×300mm · 厚3mm',      8, 2, 2),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'material',   '3mm 黄色亚克力板',  '600×300mm · 厚3mm',      8, 2, 3),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'electronic', '按键模块',          '16×16 · 4PIN',            3, 7, 4),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'electronic', '喇叭',              '16×16 · 4PIN',            5, 4, 5),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'electronic', '主控板',            'ToyLab 定制',            35, 1, 6),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'electronic', '电池组',            '21700 锂聚合物',         18, 1, 7),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'electronic', '灯光模块',          '16×16 · 4PIN',            3, 7, 8),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'mechanical', 'M4×12mm 螺丝',     '不锈钢',                  1, 4, 9);

-- ============================================================
-- 6. 制作步骤 (Electro-Bean)
-- ============================================================
INSERT IGNORE INTO case_steps (id, case_id, step_number, title, description, duration_minutes) VALUES
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 1, '准备材料',     '检查所有材料和工具是否齐全', 5),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 2, '激光切割外壳', '使用CO2激光切割机切割亚克力板', 15),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 3, '安装电子模块', '将按键模块、喇叭、LED灯安装到外壳上', 15),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 4, '连接主控板',   '用磁吸线将所有模块连接到主控板', 10),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 5, '烧录程序',     '使用ToyLab工作室编写并烧录程序', 10),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 6, '组装完成',     '固定外壳，安装电池，测试功能', 5);

-- ============================================================
-- 7. 数字资源 (Electro-Bean)
-- ============================================================
INSERT IGNORE INTO case_resources (id, case_id, resource_type, name, description) VALUES
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'dxf',      '外壳切割文件',     'Electro-Bean 外壳激光切割 DXF 文件'),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', 'code',     '示例程序源码',     'Arduino/MicroPython 示例代码'),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', '3d_model', '3D 预览模型',      'STEP 格式可交互 3D 模型');

-- ============================================================
-- 8. 开发日志 (Electro-Bean)
-- ============================================================
INSERT IGNORE INTO case_dev_logs (id, case_id, title, content, log_date, sort_order) VALUES
  (UUID(), 'c0000001-0000-0000-0000-000000000001', '项目启动',         '确定了 Electro-Bean 的基本方案', '2025-10-01', 1),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', '外壳设计完成',     '完成了亚克力外壳的 CAD 设计',    '2025-10-15', 2),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', '电路调试完成',     '所有模块联调通过',              '2025-11-01', 3),
  (UUID(), 'c0000001-0000-0000-0000-000000000001', '正式发布 v1.0',    '第一版正式上线',                '2025-11-20', 4);

-- ============================================================
-- 9. 评论
-- ============================================================
INSERT IGNORE INTO comments (id, user_id, target_type, target_id, content) VALUES
  (UUID(), 'a0000007-0000-0000-0000-000000000007', 'case', 'c0000001-0000-0000-0000-000000000001', '做了一个送给女儿，她很喜欢！'),
  (UUID(), 'a0000008-0000-0000-0000-000000000008', 'case', 'c0000001-0000-0000-0000-000000000001', '步骤很清晰，适合新手入门'),
  (UUID(), 'a0000009-0000-0000-0000-000000000009', 'case', 'c0000001-0000-0000-0000-000000000001', '请问可以用其他材料替代亚克力吗？');

-- ============================================================
-- 10. 项目
-- ============================================================
INSERT IGNORE INTO projects (id, user_id, name) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000007', '蓝色智慧小车'),
  ('d0000002-0000-0000-0000-000000000002', 'a0000007-0000-0000-0000-000000000007', 'LED 台灯'),
  ('d0000003-0000-0000-0000-000000000003', 'a0000007-0000-0000-0000-000000000007', '传感器气象站');

-- ============================================================
-- 11. 用户零件
-- ============================================================
INSERT IGNORE INTO user_parts (id, user_id, product_id, quantity, last_used_project, firmware_version) VALUES
  (UUID(), 'a0000007-0000-0000-0000-000000000007', 'b0000009-0000-0000-0000-000000000009', 3, 'Electro-Bean', 'v2.1.3'),
  (UUID(), 'a0000007-0000-0000-0000-000000000007', 'b0000010-0000-0000-0000-000000000010', 5, 'Electro-Bean', NULL),
  (UUID(), 'a0000007-0000-0000-0000-000000000007', 'b0000012-0000-0000-0000-000000000012', 12, 'LED 台灯', NULL),
  (UUID(), 'a0000007-0000-0000-0000-000000000007', 'b0000013-0000-0000-0000-000000000013', 8, '传感器气象站', NULL),
  (UUID(), 'a0000007-0000-0000-0000-000000000007', 'b0000011-0000-0000-0000-000000000011', 4, '传感器气象站', 'v1.0.2');
