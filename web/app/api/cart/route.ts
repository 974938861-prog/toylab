import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { product_id } = await request.json();
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      [user.id, product_id]
    );

    if (existing.length > 0) {
      await pool.query<ResultSetHeader>(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?",
        [existing[0].id]
      );
    } else {
      await pool.query<ResultSetHeader>(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)",
        [user.id, product_id]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cart error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
