import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT c.*, 
        u.id AS creator_id, u.username AS creator_username, 
        u.nickname AS creator_nickname, u.avatar_url AS creator_avatar_url,
        u.avatar_color AS creator_avatar_color, u.role AS creator_role
      FROM cases_ c
      LEFT JOIN users u ON c.creator_id = u.id
      WHERE c.is_published = TRUE
      ORDER BY c.created_at DESC
    `);

    const cases = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      cover_url: r.cover_url,
      description: r.description,
      difficulty: r.difficulty,
      estimated_time: r.estimated_time,
      price: Number(r.price),
      is_free: Boolean(r.is_free),
      is_published: Boolean(r.is_published),
      creator_id: r.creator_id,
      view_count: r.view_count,
      sales_count: r.sales_count,
      created_at: r.created_at,
      updated_at: r.updated_at,
      creator: {
        id: r.creator_id,
        username: r.creator_username,
        nickname: r.creator_nickname,
        avatar_url: r.creator_avatar_url,
        avatar_color: r.creator_avatar_color,
        role: r.creator_role,
      },
    }));

    return NextResponse.json(cases);
  } catch (err) {
    console.error("Cases error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
