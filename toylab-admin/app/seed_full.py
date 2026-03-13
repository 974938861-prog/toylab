"""
完整种子数据脚本
将前端 index.html 中所有硬编码的数据写入数据库，并建立关联。

覆盖范围：
  - 用户 (6 位创作者 + 3 位社区用户)
  - 商品分类 (14 个)
  - 商品 (19 个，含电子模块 + 机械零件)
  - 用户零件库 (电子 + 机械，关联用户 & 商品 & 上次使用项目)
  - 项目 (3 个，关联用户)
  - 灵感案例 (7 个，关联创作者用户)
  - 案例 BOM 物料 (关联案例 + 商品)
  - 制作步骤 SOP
  - 数字资源包
  - 开发日志
  - 社区评论 (关联案例 + 用户)
  - 收藏记录
"""
import asyncio
from datetime import date, datetime, timezone, timedelta

from sqlalchemy import text

from app.database import engine, async_session, Base
from app.models import *  # noqa
from app.models.product import ProductCategory, Product
from app.models.user import User
from app.models.project import Project, ProjectFile
from app.models.user_part import UserPart
from app.models.case import Case, CaseBomItem, CaseStep, CaseResource, CaseDevLog
from app.models.community import Favorite, Comment
from app.services.auth import hash_password


def dt(y, m, d):
    """生成带时区的 datetime"""
    return datetime(y, m, d, tzinfo=timezone.utc)


async def seed():
    # ── 清库重建 ─────────────────────────────────────────
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] 数据库已重置")

    async with async_session() as db:

        # ══════════════════════════════════════════════════
        # 1. 商品分类
        # ══════════════════════════════════════════════════
        # 一级分类
        cat_elec = ProductCategory(name="全部电子模块", slug="electronics", sort_order=1)
        cat_mech = ProductCategory(name="全部机械配件", slug="mechanical", sort_order=10)
        db.add_all([cat_elec, cat_mech])
        await db.flush()

        # 电子模块子分类
        cat_input   = ProductCategory(name="输入模块",   slug="input",   parent_id=cat_elec.id, sort_order=2)
        cat_output  = ProductCategory(name="输出模块",   slug="output",  parent_id=cat_elec.id, sort_order=3)
        cat_motor   = ProductCategory(name="动力模块",   slug="motor",   parent_id=cat_elec.id, sort_order=4)
        cat_power   = ProductCategory(name="电源模块",   slug="power",   parent_id=cat_elec.id, sort_order=5)
        cat_mcu     = ProductCategory(name="主控模块",   slug="mcu",     parent_id=cat_elec.id, sort_order=6)
        cat_wire    = ProductCategory(name="线束",       slug="wire",    parent_id=cat_elec.id, sort_order=7)
        # 机械配件子分类
        cat_gear    = ProductCategory(name="齿轮",       slug="gear",    parent_id=cat_mech.id, sort_order=11)
        cat_tire    = ProductCategory(name="轮胎",       slug="tire",    parent_id=cat_mech.id, sort_order=12)
        cat_bearing = ProductCategory(name="轴承",       slug="bearing", parent_id=cat_mech.id, sort_order=13)
        cat_spring  = ProductCategory(name="弹簧",       slug="spring",  parent_id=cat_mech.id, sort_order=14)
        cat_shaft   = ProductCategory(name="轴",         slug="shaft",   parent_id=cat_mech.id, sort_order=15)
        cat_screw   = ProductCategory(name="螺丝",       slug="screw",   parent_id=cat_mech.id, sort_order=16)
        cat_hinge   = ProductCategory(name="合页",       slug="hinge",   parent_id=cat_mech.id, sort_order=17)
        cat_pulley  = ProductCategory(name="带轮",       slug="pulley",  parent_id=cat_mech.id, sort_order=18)
        db.add_all([
            cat_input, cat_output, cat_motor, cat_power, cat_mcu, cat_wire,
            cat_gear, cat_tire, cat_bearing, cat_spring, cat_shaft, cat_screw,
            cat_hinge, cat_pulley,
        ])
        await db.flush()
        print("[OK] 商品分类 16 个")

        # ══════════════════════════════════════════════════
        # 2. 商品（电子模块 + 机械零件）
        # ══════════════════════════════════════════════════

        # ── 电子模块 ──
        p_button = Product(
            name="手按开关", slug="push-switch", category_id=cat_input.id,
            spec="16×16 · 4PIN · 磁吸", description="ToyLab 定制款磁吸接口按键，3.3V 逻辑电平",
            price=3, stock=200, stock_status="in_stock", module_type="input",
            sales_count=1203, view_count=8456,
        )
        p_button2 = Product(
            name="按键开关", slug="button-switch", category_id=cat_input.id,
            spec="16×16 · 4PIN · 磁吸", description="轻触触发，防抖处理，2引脚",
            price=3, stock=200, stock_status="in_stock", module_type="input",
            sales_count=980, view_count=5200,
        )
        p_ir = Product(
            name="红外距离传感器", slug="ir-sensor", category_id=cat_input.id,
            spec="16×16 · 4PIN · 磁吸", description="数字红外测距，检测距离 2~30cm",
            price=3, stock=150, stock_status="in_stock", module_type="input",
            sales_count=2891, view_count=12034,
        )
        p_mic = Product(
            name="麦克风", slug="mic", category_id=cat_input.id,
            spec="16×16 · 4PIN · 磁吸", description="驻极体麦克风模块，声音触发信号",
            price=3, stock=100, stock_status="in_stock", module_type="input",
            sales_count=4102, view_count=18963,
        )
        p_dht11 = Product(
            name="温湿度传感器 DHT11", slug="dht11", category_id=cat_input.id,
            spec="16×16 · 4PIN · 磁吸", description="0~50°C · 20~90%RH · 数字信号",
            price=4, stock=80, stock_status="in_stock", module_type="input",
            firmware_ver="v1.0.2", sales_count=760, view_count=4100,
        )
        p_speaker = Product(
            name="喇叭", slug="speaker", category_id=cat_output.id,
            spec="16×16 · 4PIN · 磁吸", description="8Ω · 0.5W · 直径 36mm",
            price=3, stock=180, stock_status="in_stock", module_type="output",
            sales_count=3542, view_count=15287,
        )
        p_led = Product(
            name="LED灯", slug="led-light", category_id=cat_output.id,
            spec="16×16 · 4PIN · 磁吸", description="可编程 · PWM调光 · 共3引脚",
            price=3, stock=300, stock_status="in_stock", module_type="output",
            sales_count=1456, view_count=7123,
        )
        p_rgb_led = Product(
            name="RGB LED 灯", slug="rgb-led", category_id=cat_output.id,
            spec="16×16 · 4PIN · 磁吸", description="RGB LED WS2812B · 5V · 全彩可编程",
            price=3, stock=250, stock_status="in_stock", module_type="output",
            sales_count=890, view_count=4300,
        )
        p_motor = Product(
            name="130有刷电机", slug="dc-motor-130", category_id=cat_motor.id,
            spec="32×32 · 4PIN · 磁吸", description="130型直流有刷电机，3V~6V工作电压",
            price=4, stock=80, stock_status="in_stock", module_type="motor",
            sales_count=892, view_count=5671,
        )
        p_battery_box = Product(
            name="电池盒", slug="battery-box", category_id=cat_power.id,
            spec="64×32 · 4PIN · 磁吸", description="适配 AA 5号电池，输出 3V",
            price=5, stock=60, stock_status="in_stock", module_type="power",
            sales_count=567, view_count=4238,
        )
        p_lipo = Product(
            name="锂聚合物电池21700", slug="lipo-21700", category_id=cat_power.id,
            spec="21700 锂聚合物 · 3000mAh · JST 接口",
            description="3.7V 锂聚合物电池，带过充过放保护电路",
            price=18, stock=50, stock_status="in_stock", module_type="power",
            sales_count=340, view_count=2100,
        )
        p_wire = Product(
            name="磁吸线", slug="wire-cable", category_id=cat_wire.id,
            spec="12cm · 4PIN · 磁吸", description="磁吸接口连接线，4芯，长度 12cm",
            price=1, stock=500, stock_status="in_stock", module_type="wire",
            sales_count=324, view_count=2891,
        )
        p_esp32 = Product(
            name="ESP32 主控板", slug="esp32-mcu", category_id=cat_mcu.id,
            spec="ESP32-S3 · 240MHz · Wi-Fi + BLE",
            description="双核 240MHz · WiFi 蓝牙一体 · 支持 MicroPython",
            price=35, stock=50, stock_status="in_stock", module_type="mcu",
            firmware_ver="v2.1.3", sales_count=456, view_count=3200,
        )

        # ── 机械零件 ──
        p_gear = Product(
            name="标准齿轮M1", slug="gear-m1-20t", category_id=cat_gear.id,
            spec="M1 模数 · 20齿 · POM 材质", description="标准 M1 模数正齿轮，POM 塑料，适合低速传动",
            price=2, stock=100, stock_status="in_stock",
            sales_count=620, view_count=3100,
        )
        p_tire = Product(
            name="橡胶轮胎 65mm", slug="rubber-tire-65", category_id=cat_tire.id,
            spec="径65mm · 宽26mm · 防滑纹路", description="天然橡胶材质，防滑纹路，配合D孔轮毂使用",
            price=3, stock=60, stock_status="in_stock",
            sales_count=410, view_count=2400,
        )
        p_bearing = Product(
            name="滚珠轴承608", slug="bearing-608zz", category_id=cat_bearing.id,
            spec="608ZZ 内径 8mm 外径 22mm",
            description="标准608ZZ深沟球轴承，钢制密封，低噪音",
            price=2, stock=150, stock_status="in_stock",
            sales_count=530, view_count=3000,
        )
        p_spring = Product(
            name="压缩弹簧", slug="compression-spring", category_id=cat_spring.id,
            spec="径 0.5mm · 外径 8mm · 自由长30mm",
            description="不锈钢压缩弹簧，弹力均匀，耐腐蚀",
            price=1, stock=200, stock_status="in_stock",
            sales_count=280, view_count=1500,
        )
        p_shaft = Product(
            name="不锈钢轴 D5", slug="shaft-d5-100", category_id=cat_shaft.id,
            spec="径5mm · 长100mm · 304 不锈钢",
            description="304不锈钢实心轴，可配合608轴承使用",
            price=3, stock=80, stock_status="in_stock",
            sales_count=190, view_count=1200,
        )
        p_screw = Product(
            name="M4×12mm 螺丝", slug="screw-m4x12", category_id=cat_screw.id,
            spec="M4 × 12mm · 内六角 · 304不锈钢",
            description="304不锈钢内六角圆柱头螺丝，10颗/包",
            price=1, stock=500, stock_status="in_stock",
            sales_count=450, view_count=2200,
        )

        all_products = [
            p_button, p_button2, p_ir, p_mic, p_dht11,
            p_speaker, p_led, p_rgb_led,
            p_motor, p_battery_box, p_lipo, p_wire, p_esp32,
            p_gear, p_tire, p_bearing, p_spring, p_shaft, p_screw,
        ]
        db.add_all(all_products)
        await db.flush()
        print(f"[OK] 商品 {len(all_products)} 个")

        # ══════════════════════════════════════════════════
        # 3. 用户
        # ══════════════════════════════════════════════════
        pw = hash_password("demo1234")

        # 主账号（前端 demo 用户）
        u_toylab = User(username="ToyLab官方", email="demo@toylab.io",
                        password_hash=pw, avatar_color="#7C3AED", role="creator")
        # 其他创作者（发现页出现的设计师）
        u_makerlab = User(username="MakerLab", email="makerlab@toylab.io",
                          password_hash=pw, avatar_color="#059669", role="creator")
        u_robokids = User(username="RoboKids", email="robokids@toylab.io",
                          password_hash=pw, avatar_color="#DC2626", role="creator")
        u_lightwave = User(username="LightWave", email="lightwave@toylab.io",
                           password_hash=pw, avatar_color="#D97706", role="creator")
        u_weathermaker = User(username="WeatherMaker", email="weathermaker@toylab.io",
                              password_hash=pw, avatar_color="#0284C7", role="creator")
        u_notebot = User(username="NoteBot", email="notebot@toylab.io",
                         password_hash=pw, avatar_color="#BE185D", role="creator")
        # 社区评论用户
        u_makerlin = User(username="MakerLin", email="makerlin@toylab.io",
                          password_hash=pw, avatar_color="#0284C7", role="user")
        u_aibuilder = User(username="AIBuilder", email="aibuilder@toylab.io",
                           password_hash=pw, avatar_color="#BE185D", role="user")
        u_gearfan = User(username="GearFan", email="gearfan@toylab.io",
                         password_hash=pw, avatar_color="#059669", role="user")

        all_users = [
            u_toylab, u_makerlab, u_robokids, u_lightwave,
            u_weathermaker, u_notebot,
            u_makerlin, u_aibuilder, u_gearfan,
        ]
        db.add_all(all_users)
        await db.flush()
        print(f"[OK] 用户 {len(all_users)} 个  (所有密码均为 demo1234)")

        # ══════════════════════════════════════════════════
        # 4. 我的项目（对应「我的作品库」→「我的项目」标签页）
        # ══════════════════════════════════════════════════
        proj_car = Project(
            user_id=u_toylab.id, name="蓝色智慧小车",
            cover_type="car", description="基于 ESP32 的蓝牙遥控小车，支持手机 App 控制",
        )
        proj_lamp = Project(
            user_id=u_toylab.id, name="LED 台灯",
            cover_type="led", description="可调色温 LED 台灯，积木编程实现亮度调节",
        )
        proj_weather = Project(
            user_id=u_toylab.id, name="传感器气象站",
            cover_type="sensor", description="DHT11 温湿度 + 气压传感器数据采集站",
        )
        db.add_all([proj_car, proj_lamp, proj_weather])
        await db.flush()

        # 为每个项目生成三种编程文件（空内容）
        for proj in [proj_car, proj_lamp, proj_weather]:
            for ft in ("blocks", "workflow", "python"):
                db.add(ProjectFile(project_id=proj.id, file_type=ft))
        await db.flush()
        print("[OK] 项目 3 个（含编程文件占位）")

        # ══════════════════════════════════════════════════
        # 5. 用户零件库
        #    对应「我的作品库」→「我的模块」& 零件商城→「我的零件库」
        # ══════════════════════════════════════════════════
        user_parts = [
            # ── 电子模块（简版，出现在「我的作品库」模块标签）──
            UserPart(user_id=u_toylab.id, product_id=p_esp32.id,
                     quantity=3, last_project_id=proj_car.id,
                     firmware_ver="v2.1.3"),
            UserPart(user_id=u_toylab.id, product_id=p_lipo.id,
                     quantity=5, last_project_id=proj_car.id),
            UserPart(user_id=u_toylab.id, product_id=p_led.id,
                     quantity=12, last_project_id=proj_lamp.id),
            UserPart(user_id=u_toylab.id, product_id=p_button2.id,
                     quantity=8, last_project_id=proj_weather.id),
            # ── 商城「我的电子模块」额外零件 ──
            UserPart(user_id=u_toylab.id, product_id=p_rgb_led.id,
                     quantity=12, last_project_id=proj_lamp.id),
            UserPart(user_id=u_toylab.id, product_id=p_dht11.id,
                     quantity=4, last_project_id=proj_weather.id,
                     firmware_ver="v1.0.2"),
            # ── 商城「我的机械零件」──
            UserPart(user_id=u_toylab.id, product_id=p_gear.id,
                     quantity=6, last_project_id=proj_car.id),
            UserPart(user_id=u_toylab.id, product_id=p_tire.id,
                     quantity=4, last_project_id=proj_car.id),
            UserPart(user_id=u_toylab.id, product_id=p_bearing.id,
                     quantity=10, last_project_id=proj_car.id),
            UserPart(user_id=u_toylab.id, product_id=p_spring.id,
                     quantity=8),
            UserPart(user_id=u_toylab.id, product_id=p_shaft.id,
                     quantity=5, last_project_id=proj_car.id),
        ]
        db.add_all(user_parts)
        await db.flush()
        print(f"[OK] 用户零件库 {len(user_parts)} 条")

        # ══════════════════════════════════════════════════
        # 6. 灵感案例（7 个，对应发现页卡片）
        # ══════════════════════════════════════════════════

        # ── 6-1 Electro-Bean（ToyLab官方）详细案例 ──
        case_bean = Case(
            creator_id=u_toylab.id, title="Electro-Bean",
            summary="一款使用亚克力做外壳的儿童DIY乐器",
            category="game",
            estimated_time="1h", price=0,
            view_count=6891, purchase_count=1234,
            is_published=True,
            designer_story=(
                "做这个项目是因为想给孩子一个能自己动手做的玩具。"
                "我花了三个月时间，从第一版用纸板做的原型到现在这个亚克力版本，"
                "每一个按键的音阶都是亲手调的。"
            ),
        )
        # ── 6-2 小狗鲁卡机器人（MakerLab，$12）──
        case_luka = Case(
            creator_id=u_makerlab.id, title="小狗鲁卡机器人",
            summary="一款可爱的四足仿生宠物机器人，使用舵机驱动",
            category="pet",
            estimated_time="3h", price=12,
            view_count=1847, purchase_count=324,
            is_published=True,
            designer_story="灵感来自我养的一只柴犬，想做一个永远不用遛弯的机械狗。",
        )
        # ── 6-3 Moto-Rocker（RoboKids，免费）──
        case_moto = Case(
            creator_id=u_robokids.id, title="Moto-Rocker",
            summary="磁吸积木遥控摩托车，支持手机蓝牙遥控",
            category="car",
            estimated_time="2h", price=0,
            view_count=5102, purchase_count=1203,
            is_published=True,
            designer_story="专为 8 岁以上的小朋友设计，拼装难度适中，30分钟可完成。",
        )
        # ── 6-4 Polaris Kids Desk Lamp（LightWave，$8）──
        case_lamp = Case(
            creator_id=u_lightwave.id, title="Polaris Kids Desk Lamp",
            summary="极简风格儿童护眼台灯，可编程调节色温与亮度",
            category="appliance",
            estimated_time="1.5h", price=8,
            view_count=987, purchase_count=156,
            is_published=True,
            designer_story="孩子总是把台灯调得太亮，所以我做了一个能按时间自动调光的版本。",
        )
        # ── 6-5 气象站数据采集器（WeatherMaker，免费）──
        case_weather = Case(
            creator_id=u_weathermaker.id, title="气象站数据采集器",
            summary="温湿度+气压实时采集，数据上传至网页端可视化",
            category="tool",
            estimated_time="2h", price=0,
            view_count=4218, purchase_count=763,
            is_published=True,
            designer_story="做给学校气象兴趣小组使用，成本比市售气象站低 90%。",
        )
        # ── 6-6 迷你钢琴电子琴（NoteBot，$6）──
        case_piano = Case(
            creator_id=u_notebot.id, title="迷你钢琴电子琴",
            summary="7键可编程电子琴，配合喇叭实现音阶播放",
            category="game",
            estimated_time="1h", price=6,
            view_count=652, purchase_count=89,
            is_published=True,
            designer_story="用来教孩子认识 Do Re Mi，每个音阶对应一个颜色按键。",
        )
        # ── 6-7 智能感应赛车（ToyLab官方，免费）──
        case_kart = Case(
            creator_id=u_toylab.id, title="智能感应赛车",
            summary="红外线避障自动赛车，积木编程控制避障逻辑",
            category="car",
            estimated_time="2.5h", price=0,
            view_count=6891, purchase_count=1567,
            is_published=True,
            designer_story="ToyLab 官方入门套件，适合第一次接触机器人编程的小朋友。",
        )

        all_cases = [
            case_bean, case_luka, case_moto, case_lamp,
            case_weather, case_piano, case_kart,
        ]
        db.add_all(all_cases)
        await db.flush()
        print(f"[OK] 案例 {len(all_cases)} 个")

        # ══════════════════════════════════════════════════
        # 7. 案例 BOM 物料（关联商品）
        #    以 Electro-Bean 为完整示例，其余案例给基础清单
        # ══════════════════════════════════════════════════

        def bom(case_id, item_type, name, spec, price, qty, sort, product=None):
            return CaseBomItem(
                case_id=case_id, item_type=item_type, name=name, spec=spec,
                unit_price=price, required_qty=qty, sort_order=sort,
                product_id=product.id if product else None,
            )

        # Electro-Bean BOM（完整，与前端案例详情一致）
        bean_bom = [
            bom(case_bean.id, "material", "3mm 紫色亚克力板",
                "600×300mm · 厚3mm · 激光切割用", 8, 2, 1),
            bom(case_bean.id, "material", "3mm 黄色亚克力板",
                "600×300mm · 厚3mm · 激光切割用", 8, 2, 2),
            bom(case_bean.id, "module", "按键模块",
                "ToyLab 定制款 · 磁吸接口 · 3.3V", 3, 7, 3, p_button),
            bom(case_bean.id, "module", "喇叭",
                "8Ω · 0.5W · 直径 36mm", 5, 4, 4, p_speaker),
            bom(case_bean.id, "module", "主控板",
                "ESP32-S3 · 240MHz · Wi-Fi + BLE", 35, 1, 5, p_esp32),
            bom(case_bean.id, "module", "电池组",
                "3.7V · 1200mAh · 防过放保护", 18, 1, 6, p_lipo),
            bom(case_bean.id, "module", "灯光模块",
                "RGB LED WS2812B · 5V · 全彩可编程", 3, 7, 7, p_rgb_led),
            bom(case_bean.id, "mechanical", "M4×12mm 螺丝",
                "M4 × 12mm · 内六角 · 304不锈钢", 1, 4, 8, p_screw),
        ]
        # 小狗鲁卡 BOM
        luka_bom = [
            bom(case_luka.id, "module", "ESP32 主控板",
                "ESP32-S3 · 双核 240MHz", 35, 1, 1, p_esp32),
            bom(case_luka.id, "module", "锂聚合物电池",
                "3.7V · 3000mAh", 18, 1, 2, p_lipo),
            bom(case_luka.id, "mechanical", "不锈钢轴 D5",
                "径5mm · 长100mm", 3, 4, 3, p_shaft),
        ]
        # Moto-Rocker BOM
        moto_bom = [
            bom(case_moto.id, "module", "130有刷电机",
                "3V~6V · 磁吸接口", 4, 2, 1, p_motor),
            bom(case_moto.id, "module", "ESP32 主控板",
                "ESP32-S3", 35, 1, 2, p_esp32),
            bom(case_moto.id, "mechanical", "橡胶轮胎 65mm",
                "径65mm · 宽26mm", 3, 4, 3, p_tire),
            bom(case_moto.id, "mechanical", "标准齿轮M1",
                "M1 模数 · 20齿", 2, 6, 4, p_gear),
        ]
        # 台灯 BOM
        lamp_bom = [
            bom(case_lamp.id, "module", "LED灯",
                "PWM调光 · 可编程", 3, 6, 1, p_led),
            bom(case_lamp.id, "module", "ESP32 主控板",
                "ESP32-S3", 35, 1, 2, p_esp32),
            bom(case_lamp.id, "module", "按键开关",
                "轻触触发 · 磁吸", 3, 2, 3, p_button),
        ]
        # 气象站 BOM
        weather_bom = [
            bom(case_weather.id, "module", "温湿度传感器 DHT11",
                "0~50°C · 20~90%RH", 4, 2, 1, p_dht11),
            bom(case_weather.id, "module", "ESP32 主控板",
                "ESP32-S3 · Wi-Fi", 35, 1, 2, p_esp32),
            bom(case_weather.id, "module", "锂聚合物电池",
                "3.7V · 3000mAh", 18, 1, 3, p_lipo),
        ]
        # 钢琴 BOM
        piano_bom = [
            bom(case_piano.id, "module", "按键开关",
                "磁吸 · 防抖处理", 3, 7, 1, p_button2),
            bom(case_piano.id, "module", "喇叭",
                "8Ω · 0.5W", 3, 2, 2, p_speaker),
            bom(case_piano.id, "module", "ESP32 主控板",
                "ESP32-S3", 35, 1, 3, p_esp32),
            bom(case_piano.id, "module", "LED灯（指示灯）",
                "PWM调光", 3, 7, 4, p_led),
        ]
        # 感应赛车 BOM
        kart_bom = [
            bom(case_kart.id, "module", "红外距离传感器",
                "检测距离 2~30cm", 3, 2, 1, p_ir),
            bom(case_kart.id, "module", "130有刷电机",
                "3V~6V", 4, 2, 2, p_motor),
            bom(case_kart.id, "module", "ESP32 主控板",
                "ESP32-S3", 35, 1, 3, p_esp32),
            bom(case_kart.id, "mechanical", "橡胶轮胎 65mm",
                "径65mm", 3, 4, 4, p_tire),
        ]

        all_bom = (bean_bom + luka_bom + moto_bom + lamp_bom
                   + weather_bom + piano_bom + kart_bom)
        db.add_all(all_bom)
        await db.flush()
        print(f"[OK] BOM 物料 {len(all_bom)} 条")

        # ══════════════════════════════════════════════════
        # 8. 制作步骤 SOP（Electro-Bean 完整，其余简化）
        # ══════════════════════════════════════════════════
        def step(case_id, num, title, desc):
            return CaseStep(case_id=case_id, step_number=num, title=title, description=desc)

        all_steps = [
            # Electro-Bean
            step(case_bean.id, 1, "绘制图纸 & 建模",
                 "使用 ToyLab 完成外壳建模与激光切割路径规划"),
            step(case_bean.id, 2, "激光切割加工",
                 "导入矢量文件，用CO2激光机切割亚克力面板与外壳件"),
            step(case_bean.id, 3, "拼装组合",
                 "按结构图拼装外壳，使用磁吸接口连接各电子模块"),
            step(case_bean.id, 4, "编写程序",
                 "在 ToyLab 工作室中用积木编程实现按键音阶控制"),
            step(case_bean.id, 5, "调试 & 完善",
                 "在 ToyLab 中烧录程序并完成整体功能调试与音阶校准"),
            # 小狗鲁卡
            step(case_luka.id, 1, "3D 打印狗腿关节", "导入 STL 文件，打印 12 个关节件"),
            step(case_luka.id, 2, "组装舵机与关节", "将舵机固定到关节，用轴销连接"),
            step(case_luka.id, 3, "连接主控 & 编程", "在 ToyLab 中用 Workflow 编写步态逻辑"),
            # Moto-Rocker
            step(case_moto.id, 1, "拼装车身骨架", "按说明书拼装磁吸积木车身"),
            step(case_moto.id, 2, "安装电机 & 轮胎", "将电机固定到后轮，安装橡胶轮胎"),
            step(case_moto.id, 3, "积木编程遥控逻辑",
                 "在 ToyLab 工作室中设置蓝牙遥控的前进后退转向逻辑"),
            # 台灯
            step(case_lamp.id, 1, "激光切割灯架", "切割亚克力灯罩与底座"),
            step(case_lamp.id, 2, "焊接 LED 组件", "将 LED 模块焊接到灯头电路板"),
            step(case_lamp.id, 3, "编程调光逻辑",
                 "用 ToyLab 积木实现按键循环切换亮度档位"),
            # 气象站
            step(case_weather.id, 1, "连接传感器",
                 "将 DHT11 传感器通过磁吸接口连接到 ESP32"),
            step(case_weather.id, 2, "编写采集程序",
                 "用 ToyLab Python 模式编写定时读取温湿度的代码"),
            step(case_weather.id, 3, "数据上云",
                 "配置 Wi-Fi 连接，将数据上报到 ToyLab 数据看板"),
            # 迷你钢琴
            step(case_piano.id, 1, "搭建琴键", "用7个按键模块磁吸拼成一排琴键"),
            step(case_piano.id, 2, "编写音阶映射",
                 "在 ToyLab 积木中将每个按键映射到对应音符频率"),
            step(case_piano.id, 3, "调试音准",
                 "用喇叭播放并对比标准音阶，微调 PWM 频率"),
            # 感应赛车
            step(case_kart.id, 1, "拼装车身", "将积木车身按图纸搭建"),
            step(case_kart.id, 2, "安装传感器",
                 "将红外传感器安装在车头两侧，检测前方障碍"),
            step(case_kart.id, 3, "编写避障逻辑",
                 "在 ToyLab 积木中用条件判断实现遇障转向"),
        ]
        db.add_all(all_steps)
        await db.flush()
        print(f"[OK] 制作步骤 {len(all_steps)} 条")

        # ══════════════════════════════════════════════════
        # 9. 数字资源包（Electro-Bean 完整，其余简化）
        # ══════════════════════════════════════════════════
        def res(case_id, rtype, name, desc, fmt):
            return CaseResource(case_id=case_id, resource_type=rtype,
                                name=name, description=desc, file_format=fmt)

        all_resources = [
            # Electro-Bean
            res(case_bean.id, "digital_file", "Electro-Bean 外形文件",
                "外壳 & 结构件 3D 模型", ".step / .stl"),
            res(case_bean.id, "digital_file", "外壳激光切割矢量图",
                "适用于CO2激光切割机导入", ".svg / .dxf"),
            res(case_bean.id, "digital_file", "外观装饰贴纸图案",
                "外壳 & Logo 图案文件", ".svg / .dxf"),
            res(case_bean.id, "firmware", "Electro-Bean 固件",
                "积木文件 & Python 源码", ".bin / .ino"),
            # 小狗鲁卡
            res(case_luka.id, "digital_file", "鲁卡关节 3D 打印文件",
                "12个关节件 STL 文件", ".stl"),
            res(case_luka.id, "firmware", "鲁卡步态控制固件",
                "Workflow 流程图 & Python 源码", ".bin"),
            # Moto-Rocker
            res(case_moto.id, "firmware", "Moto-Rocker 遥控固件",
                "蓝牙遥控积木程序", ".bin"),
            # 台灯
            res(case_lamp.id, "digital_file", "台灯灯架切割图",
                "亚克力灯罩切割矢量图", ".svg"),
            res(case_lamp.id, "firmware", "台灯调光固件", "PWM调光积木程序", ".bin"),
            # 气象站
            res(case_weather.id, "firmware", "气象站采集程序",
                "Python 数据采集 & 上云代码", ".py"),
            # 钢琴
            res(case_piano.id, "firmware", "电子琴音阶固件",
                "7音阶按键映射积木程序", ".bin"),
            # 感应赛车
            res(case_kart.id, "firmware", "感应赛车避障固件",
                "红外避障积木逻辑程序", ".bin"),
        ]
        db.add_all(all_resources)
        await db.flush()
        print(f"[OK] 数字资源包 {len(all_resources)} 条")

        # ══════════════════════════════════════════════════
        # 10. 开发日志
        # ══════════════════════════════════════════════════
        def log(case_id, ltype, content, d):
            return CaseDevLog(case_id=case_id, log_type=ltype,
                              content=content, logged_at=d)

        all_logs = [
            # Electro-Bean（与前端一致）
            log(case_bean.id, "update",
                "v2.1 修复了音阶漂移问题，优化按键防抖与响应逻辑",
                date(2025, 11, 20)),
            log(case_bean.id, "feature",
                "新增蓝牙无线控制，支持 App 远程演奏与录音",
                date(2025, 10, 5)),
            log(case_bean.id, "fix",
                "修复多键同按时主控崩溃的问题，提升整体稳定性",
                date(2025, 9, 12)),
            # 小狗鲁卡
            log(case_luka.id, "feature",
                "v1.2 新增跑步步态，速度提升 40%", date(2026, 1, 15)),
            log(case_luka.id, "fix",
                "修复右前腿舵机抖动问题", date(2025, 12, 8)),
            # Moto-Rocker
            log(case_moto.id, "update",
                "v1.1 优化蓝牙延迟，响应时间降低至 20ms", date(2026, 2, 1)),
            # 台灯
            log(case_lamp.id, "feature",
                "新增定时熄灯功能，支持 30/60 分钟设定", date(2026, 1, 20)),
            # 气象站
            log(case_weather.id, "update",
                "接入 ToyLab 数据看板，支持历史曲线查看", date(2026, 2, 10)),
        ]
        db.add_all(all_logs)
        await db.flush()
        print(f"[OK] 开发日志 {len(all_logs)} 条")

        # ══════════════════════════════════════════════════
        # 11. 社区评论（对应 Electro-Bean 案例详情页）
        # ══════════════════════════════════════════════════
        comments = [
            Comment(user_id=u_makerlin.id, target_type="case",
                    target_id=case_bean.id,
                    content="这个案例太棒了！按键音效设计很巧妙，孩子非常喜欢！"),
            Comment(user_id=u_aibuilder.id, target_type="case",
                    target_id=case_bean.id,
                    content="已经做完了，喇叭音色很圆润，建议再多加几个音阶！"),
            Comment(user_id=u_gearfan.id, target_type="case",
                    target_id=case_bean.id,
                    content="外壳也可以用 PLA 3D 打印替代亚克力，效果同样不错！"),
            Comment(user_id=u_toylab.id, target_type="case",
                    target_id=case_luka.id,
                    content="鲁卡的步态真的很流畅，MakerLab 出品必属精品！"),
            Comment(user_id=u_makerlin.id, target_type="case",
                    target_id=case_kart.id,
                    content="感应赛车用来教孩子编程太合适了，买了两套！"),
        ]
        db.add_all(comments)
        await db.flush()
        print(f"[OK] 社区评论 {len(comments)} 条")

        # ══════════════════════════════════════════════════
        # 12. 收藏记录
        # ══════════════════════════════════════════════════
        favorites = [
            Favorite(user_id=u_toylab.id,    target_type="case", target_id=case_luka.id),
            Favorite(user_id=u_toylab.id,    target_type="case", target_id=case_moto.id),
            Favorite(user_id=u_toylab.id,    target_type="case", target_id=case_piano.id),
            Favorite(user_id=u_makerlin.id,  target_type="case", target_id=case_bean.id),
            Favorite(user_id=u_aibuilder.id, target_type="case", target_id=case_bean.id),
            Favorite(user_id=u_gearfan.id,   target_type="case", target_id=case_kart.id),
            Favorite(user_id=u_makerlin.id,  target_type="product", target_id=p_esp32.id),
            Favorite(user_id=u_toylab.id,    target_type="product", target_id=p_dht11.id),
        ]
        db.add_all(favorites)
        await db.flush()
        print(f"[OK] 收藏记录 {len(favorites)} 条")

        await db.commit()

    print()
    print("=" * 50)
    print("[DONE] 所有数据写入完成！")
    print()
    print("账号列表（密码均为 demo1234）：")
    accounts = [
        ("ToyLab官方（主账号）", "demo@toylab.io"),
        ("MakerLab",             "makerlab@toylab.io"),
        ("RoboKids",             "robokids@toylab.io"),
        ("LightWave",            "lightwave@toylab.io"),
        ("WeatherMaker",         "weathermaker@toylab.io"),
        ("NoteBot",              "notebot@toylab.io"),
        ("MakerLin（社区用户）", "makerlin@toylab.io"),
        ("AIBuilder（社区用户）","aibuilder@toylab.io"),
        ("GearFan（社区用户）",  "gearfan@toylab.io"),
    ]
    for name, email in accounts:
        print(f"  {name:<20} {email}")
    print()
    print("数据汇总：")
    print("  商品分类  16 个")
    print(f"  商品     {len(all_products)} 个")
    print(f"  案例      {len(all_cases)} 个")
    print(f"  BOM物料  {len(all_bom)} 条")
    print(f"  制作步骤 {len(all_steps)} 条")
    print(f"  数字资源 {len(all_resources)} 条")
    print(f"  开发日志 {len(all_logs)} 条")
    print(f"  评论      {len(comments)} 条")
    print(f"  收藏      {len(favorites)} 条")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(seed())
