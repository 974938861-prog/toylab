"""一次性脚本：为案例和商品补充占位图 URL"""
import asyncio
import aiomysql

CASE_PLACEHOLDER = "https://placehold.co/400x300/7C3AED/white?text=Case"
PRODUCT_PLACEHOLDER = "https://placehold.co/200x200/059669/white?text=Part"


async def main():
    conn = await aiomysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="admin@123456",
        db="toylab",
        charset="utf8mb4",
    )
    cur = await conn.cursor()
    await cur.execute(
        "UPDATE cases_ SET cover_url = %s WHERE cover_url IS NULL OR cover_url = ''",
        (CASE_PLACEHOLDER,),
    )
    cases_updated = cur.rowcount
    await cur.execute(
        "UPDATE products SET cover_url = %s WHERE cover_url IS NULL OR cover_url = ''",
        (PRODUCT_PLACEHOLDER,),
    )
    products_updated = cur.rowcount
    await conn.commit()
    await cur.close()
    conn.close()
    print(f"已更新: 案例 {cases_updated} 条, 商品 {products_updated} 条. 请刷新发现页与零件商城.")


if __name__ == "__main__":
    asyncio.run(main())
