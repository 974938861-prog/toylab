"""一次性脚本：将种子用户密码改为 Test123456! 对应的 bcrypt 哈希"""
import asyncio
import aiomysql

NEW_HASH = "$2b$12$btRimU9MqmZFTj32NLBm2uJpM6ESdhiEltUu7TcA8frLHGviujDZe"


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
        "UPDATE users SET password_hash = %s WHERE email LIKE %s",
        (NEW_HASH, "%@toylab.test"),
    )
    print("Updated", cur.rowcount, "rows. 可用 toylab@toylab.test / Test123456! 登录")
    await conn.commit()
    await cur.close()
    conn.close()


if __name__ == "__main__":
    asyncio.run(main())
