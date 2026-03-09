"""
将当前网页 UI 截图为 PNG，便于导入 Pencil Project 进行修改。
运行前请先启动本地服务：在 prototype 目录执行 python -m http.server 8080
"""
import asyncio
import os

async def main():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("请先安装: pip install playwright")
        print("然后执行: python -m playwright install chromium")
        return
    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(out_dir, "toylab-ui-for-pencil.png")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            await page.goto("http://localhost:8080", wait_until="networkidle", timeout=10000)
        except Exception as e:
            print("无法打开 http://localhost:8080 请先启动服务：")
            print("  cd prototype")
            print("  python -m http.server 8080")
            print("错误:", e)
            await browser.close()
            return
        await page.screenshot(path=out_path, full_page=True)
        await browser.close()
    print("已保存:", out_path)
    print("在 Pencil 中: 文件 -> 打开/插入 -> 插入图片，选择该 PNG 即可作为底图修改。")

if __name__ == "__main__":
    asyncio.run(main())
