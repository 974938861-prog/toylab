import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { target_type, target_id, content } = await request.json();
    await pool.query(
      "INSERT INTO comments (user_id, target_type, target_id, content) VALUES (?, ?, ?, ?)",
      [user.id, target_type, target_id, content]
    );

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT cm.*, u.username AS user_username, u.nickname AS user_nickname,
        u.avatar_url AS user_avatar_url, u.avatar_color AS user_avatar_color
      FROM comments cm LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.user_id = ? AND cm.target_type = ? AND cm.target_id = ?
      ORDER BY cm.created_at DESC LIMIT 1
    `, [user.id, target_type, target_id]);

    const c = rows[0];
    return NextResponse.json({
      id: c.id, user_id: c.user_id, target_type: c.target_type, target_id: c.target_id,
      content: c.content, created_at: c.created_at,
      user: {
        id: c.user_id, username: c.user_username, nickname: c.user_nickname,
        avatar_url: c.user_avatar_url, avatar_color: c.user_avatar_color,
      },
    });
  } catch (err) {
    console.error("Comment error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
