import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json([]);

    const url = new URL(request.url);
    const targetType = url.searchParams.get("target_type");

    let query = "SELECT * FROM favorites WHERE user_id = ?";
    const params: string[] = [user.id];
    if (targetType) {
      query += " AND target_type = ?";
      params.push(targetType);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { target_type, target_id } = await request.json();
    await pool.query<ResultSetHeader>(
      "INSERT IGNORE INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)",
      [user.id, target_type, target_id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Favorite add error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { target_type, target_id } = await request.json();
    await pool.query<ResultSetHeader>(
      "DELETE FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?",
      [user.id, target_type, target_id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Favorite delete error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
