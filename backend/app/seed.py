"""种子数据：填充商品分类和示例商品，方便开发测试"""
import asyncio

from sqlalchemy import select

from app.database import engine, async_session, Base
from app.models import *  # noqa: F401,F403  确保所有表注册
from app.models.product import ProductCategory, Product
from app.models.user import User
from app.models.case import Case, CaseBomItem, CaseStep, CaseResource, CaseDevLog
from app.services.auth import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing = await db.execute(select(ProductCategory).limit(1))
        if existing.scalar_one_or_none():
            print("数据已存在，跳过种子填充")
            return

        # ── 商品分类 ──
        cats = {
            "electronics": ProductCategory(name="全部电子模块", slug="electronics", sort_order=1),
            "input": ProductCategory(name="输入模块", slug="input", sort_order=2),
            "output": ProductCategory(name="输出模块", slug="output", sort_order=3),
            "motor": ProductCategory(name="动力模块", slug="motor", sort_order=4),
            "power": ProductCategory(name="电源模块", slug="power", sort_order=5),
            "mcu": ProductCategory(name="主控模块", slug="mcu", sort_order=6),
            "wire": ProductCategory(name="线束", slug="wire", sort_order=7),
            "mechanical": ProductCategory(name="全部机械配件", slug="mechanical", sort_order=10),
            "gear": ProductCategory(name="齿轮", slug="gear", sort_order=11),
            "tire": ProductCategory(name="轮胎", slug="tire", sort_order=12),
            "bearing": ProductCategory(name="轴承", slug="bearing", sort_order=13),
            "spring": ProductCategory(name="弹簧", slug="spring", sort_order=14),
            "shaft": ProductCategory(name="轴", slug="shaft", sort_order=15),
            "screw": ProductCategory(name="螺丝", slug="screw", sort_order=16),
        }
        for c in cats.values():
            db.add(c)
        await db.flush()

        cats["input"].parent_id = cats["electronics"].id
        cats["output"].parent_id = cats["electronics"].id
        cats["motor"].parent_id = cats["electronics"].id
        cats["power"].parent_id = cats["electronics"].id
        cats["mcu"].parent_id = cats["electronics"].id
        cats["wire"].parent_id = cats["electronics"].id
        cats["gear"].parent_id = cats["mechanical"].id
        cats["tire"].parent_id = cats["mechanical"].id
        cats["bearing"].parent_id = cats["mechanical"].id
        cats["spring"].parent_id = cats["mechanical"].id
        cats["shaft"].parent_id = cats["mechanical"].id
        cats["screw"].parent_id = cats["mechanical"].id
        await db.flush()

        # ── 示例商品 ──
        products = [
            Product(name="手按开关", slug="push-switch", category_id=cats["input"].id,
                    spec="16×16 · 4PIN · 磁吸", price=3, stock=200,
                    module_type="input", sales_count=1203, view_count=8456),
            Product(name="红外距离传感器", slug="ir-sensor", category_id=cats["input"].id,
                    spec="16×16 · 4PIN · 磁吸", price=3, stock=150,
                    module_type="input", sales_count=2891, view_count=12034),
            Product(name="麦克风", slug="mic", category_id=cats["input"].id,
                    spec="16×16 · 4PIN · 磁吸", price=3, stock=100,
                    module_type="input", sales_count=4102, view_count=18963),
            Product(name="喇叭", slug="speaker", category_id=cats["output"].id,
                    spec="16×16 · 4PIN · 磁吸", price=3, stock=180,
                    module_type="output", sales_count=3542, view_count=15287),
            Product(name="LED灯", slug="led-light", category_id=cats["output"].id,
                    spec="16×16 · 4PIN · 磁吸", price=3, stock=300,
                    module_type="output", sales_count=1456, view_count=7123),
            Product(name="130有刷电机", slug="dc-motor-130", category_id=cats["motor"].id,
                    spec="32×32 · 4PIN · 磁吸", price=4, stock=80,
                    module_type="motor", sales_count=892, view_count=5671),
            Product(name="电池盒", slug="battery-box", category_id=cats["power"].id,
                    spec="64×32 · 4PIN · 磁吸", price=5, stock=60,
                    module_type="power", sales_count=567, view_count=4238),
            Product(name="磁吸线", slug="wire-cable", category_id=cats["wire"].id,
                    spec="12cm · 4PIN · 磁吸", price=1, stock=500,
                    module_type="wire", sales_count=324, view_count=2891),
            Product(name="ESP32 主控板", slug="esp32-mcu", category_id=cats["mcu"].id,
                    spec="ESP32-S3 · 240MHz · Wi-Fi + BLE", price=35, stock=50,
                    module_type="mcu", firmware_ver="v2.1.3",
                    sales_count=456, view_count=3200),
        ]
        for p in products:
            db.add(p)
        await db.flush()

        # ── 演示用户 ──
        demo_user = User(
            username="ToyLab官方",
            email="demo@toylab.io",
            password_hash=hash_password("demo1234"),
            avatar_color="#7C3AED",
            role="creator",
        )
        db.add(demo_user)
        await db.flush()

        # ── 演示案例 ──
        case = Case(
            creator_id=demo_user.id,
            title="Electro-Bean",
            summary="一款使用亚克力做外壳的儿童DIY乐器",
            category="game",
            estimated_time="1h",
            price=0,
            view_count=6891,
            purchase_count=1234,
            designer_story="做这个项目是因为想给孩子一个能自己动手做的玩具。"
                           "我花了三个月时间，从第一版用纸板做的原型到现在这个亚克力版本，"
                           "每一个按键的音阶都是亲手调的。",
        )
        db.add(case)
        await db.flush()

        product_map = {p.slug: p for p in products}
        bom_items = [
            CaseBomItem(case_id=case.id, item_type="material", name="3mm 紫色亚克力板",
                        spec="600×300mm · 厚3mm", unit_price=8, required_qty=2, sort_order=1),
            CaseBomItem(case_id=case.id, item_type="material", name="3mm 黄色亚克力板",
                        spec="600×300mm · 厚3mm", unit_price=8, required_qty=2, sort_order=2),
            CaseBomItem(case_id=case.id, item_type="module", name="手按开关",
                        product_id=product_map["push-switch"].id,
                        spec="ToyLab 定制款 · 磁吸接口", unit_price=3, required_qty=7, sort_order=3),
            CaseBomItem(case_id=case.id, item_type="module", name="喇叭",
                        product_id=product_map["speaker"].id,
                        spec="8Ω · 0.5W · 直径 36mm", unit_price=5, required_qty=4, sort_order=4),
            CaseBomItem(case_id=case.id, item_type="module", name="主控板",
                        product_id=product_map["esp32-mcu"].id,
                        spec="ESP32-S3 · 240MHz", unit_price=35, required_qty=1, sort_order=5),
            CaseBomItem(case_id=case.id, item_type="module", name="LED灯",
                        product_id=product_map["led-light"].id,
                        spec="RGB LED WS2812B · 全彩可编程", unit_price=3, required_qty=7, sort_order=6),
            CaseBomItem(case_id=case.id, item_type="mechanical", name="M4×12mm 螺丝",
                        spec="M4 × 12mm · 内六角 · 304不锈钢", unit_price=1, required_qty=4, sort_order=7),
        ]
        for b in bom_items:
            db.add(b)

        steps = [
            CaseStep(case_id=case.id, step_number=1, title="绘制图纸 & 建模",
                     description="使用 ToyLab 完成外壳建模与激光切割路径规划"),
            CaseStep(case_id=case.id, step_number=2, title="激光切割加工",
                     description="导入矢量文件，用CO2激光机切割亚克力面板与外壳件"),
            CaseStep(case_id=case.id, step_number=3, title="拼装组合",
                     description="按结构图拼装外壳，使用磁吸接口连接各电子模块"),
            CaseStep(case_id=case.id, step_number=4, title="编写程序",
                     description="在 ToyLab 工作室中用积木编程实现按键音阶控制"),
            CaseStep(case_id=case.id, step_number=5, title="调试 & 完善",
                     description="在 ToyLab 中烧录程序并完成整体功能调试与音阶校准"),
        ]
        for s in steps:
            db.add(s)

        resources = [
            CaseResource(case_id=case.id, resource_type="digital_file",
                         name="Electro-Bean 外形文件", description="外壳 & 结构件 3D 模型",
                         file_format=".step / .stl"),
            CaseResource(case_id=case.id, resource_type="digital_file",
                         name="外壳激光切割矢量图", description="适用于CO2激光切割机导入",
                         file_format=".svg / .dxf"),
            CaseResource(case_id=case.id, resource_type="firmware",
                         name="Electro-Bean 固件", description="积木文件 & Python 源码",
                         file_format=".bin / .ino"),
        ]
        for r in resources:
            db.add(r)

        from datetime import date
        dev_logs = [
            CaseDevLog(case_id=case.id, log_type="update",
                       content="v2.1 修复了音阶漂移问题，优化按键防抖与响应逻辑",
                       logged_at=date(2025, 11, 20)),
            CaseDevLog(case_id=case.id, log_type="feature",
                       content="新增蓝牙无线控制，支持 App 远程演奏与录音",
                       logged_at=date(2025, 10, 5)),
            CaseDevLog(case_id=case.id, log_type="fix",
                       content="修复多键同按时主控崩溃的问题，提升整体稳定性",
                       logged_at=date(2025, 9, 12)),
        ]
        for d in dev_logs:
            db.add(d)

        await db.commit()
        print("种子数据填充完成！")
        print(f"  演示账号: demo@toylab.io / demo1234")
        print(f"  商品: {len(products)} 个")
        print(f"  案例: Electro-Bean")


if __name__ == "__main__":
    asyncio.run(seed())
