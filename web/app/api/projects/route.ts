import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ projects: [], userParts: [] });

    const [projects] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
      [user.id]
    );

    const [parts] = await pool.query<RowDataPacket[]>(`
      SELECT up.*, p.name AS product_name, p.spec AS product_spec, 
        p.price AS product_price, p.category_id AS product_category_id,
        p.cover_url AS product_cover_url
      FROM user_parts up
      LEFT JOIN products p ON up.product_id = p.id
      WHERE up.user_id = ?
    `, [user.id]);

    const userParts = parts.map((pt) => ({
      id: pt.id, user_id: pt.user_id, product_id: pt.product_id,
      quantity: pt.quantity, last_used_project: pt.last_used_project,
      firmware_version: pt.firmware_version, added_at: pt.added_at,
      product: pt.product_name ? {
        id: pt.product_id, name: pt.product_name, spec: pt.product_spec,
        price: Number(pt.product_price), category_id: pt.product_category_id,
        cover_url: pt.product_cover_url,
      } : null,
    }));

    return NextResponse.json({
      projects: projects.map((p) => ({ ...p, is_public: Boolean(p.is_public) })),
      userParts,
    });
  } catch (err) {
    console.error("Projects error:", err);
    return NextResponse.json({ projects: [], userParts: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { name } = await request.json();
    await pool.query<ResultSetHeader>(
      "INSERT INTO projects (user_id, name) VALUES (?, ?)",
      [user.id, name]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("Create project error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { id } = await request.json();
    await pool.query<ResultSetHeader>(
      "DELETE FROM projects WHERE id = ? AND user_id = ?",
      [id, user.id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete project error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
