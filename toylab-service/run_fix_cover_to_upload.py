"""一次性脚本：把已上传的封面文件写回案例的 cover_url，使 Web 发现页能显示 admin 上传的图"""
import os
from pathlib import Path

try:
    import pymysql
except ImportError:
    print("请先安装: pip install pymysql")
    raise SystemExit(1)

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "./uploads"))
CASES_DIR = UPLOAD_DIR / "cases"


def main():
    if not CASES_DIR.exists():
        print(f"目录不存在: {CASES_DIR}，请先在 admin 上传封面后再运行本脚本。")
        return
    files = [f.name for f in CASES_DIR.iterdir() if f.is_file()]
    if not files:
        print(f"目录为空: {CASES_DIR}，请先在 admin 上传封面。")
        return

    conn = pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="admin@123456",
        db="toylab",
        charset="utf8mb4",
    )
    cur = conn.cursor()
    cover_url = f"/uploads/cases/{files[0]}"
    cur.execute("SELECT id FROM cases_ ORDER BY created_at ASC LIMIT 1")
    row = cur.fetchone()
    if not row:
        print("数据库中没有案例，跳过。")
        cur.close()
        conn.close()
        return
    case_id = row[0]
    cur.execute("UPDATE cases_ SET cover_url = %s WHERE id = %s", (cover_url, case_id))
    conn.commit()
    cur.close()
    conn.close()
    print(f"已把 1 个案例的封面设为: {cover_url}")
    print("请刷新发现页，应能看到 admin 上传的图片。")


if __name__ == "__main__":
    main()
