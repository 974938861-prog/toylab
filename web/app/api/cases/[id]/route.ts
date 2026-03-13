import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [caseRows] = await pool.query<RowDataPacket[]>(`
      SELECT c.*, 
        u.id AS creator_id, u.username AS creator_username,
        u.nickname AS creator_nickname, u.avatar_url AS creator_avatar_url,
        u.avatar_color AS creator_avatar_color, u.role AS creator_role
      FROM cases_ c LEFT JOIN users u ON c.creator_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (caseRows.length === 0) {
      return NextResponse.json({ error: "案例未找到" }, { status: 404 });
    }

    const r = caseRows[0];
    const caseData = {
      id: r.id, title: r.title, slug: r.slug, cover_url: r.cover_url,
      description: r.description, difficulty: r.difficulty, estimated_time: r.estimated_time,
      price: Number(r.price), is_free: Boolean(r.is_free), is_published: Boolean(r.is_published),
      creator_id: r.creator_id, view_count: r.view_count, sales_count: r.sales_count,
      created_at: r.created_at, updated_at: r.updated_at,
      creator: {
        id: r.creator_id, username: r.creator_username, nickname: r.creator_nickname,
        avatar_url: r.creator_avatar_url, avatar_color: r.creator_avatar_color, role: r.creator_role,
      },
    };

    const [bomItems] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM case_bom_items WHERE case_id = ? ORDER BY sort_order", [id]
    );
    const [steps] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM case_steps WHERE case_id = ? ORDER BY step_number", [id]
    );
    const [resources] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM case_resources WHERE case_id = ? ORDER BY sort_order", [id]
    );
    const [devLogs] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM case_dev_logs WHERE case_id = ? ORDER BY sort_order", [id]
    );
    const [comments] = await pool.query<RowDataPacket[]>(`
      SELECT cm.*, u.username AS user_username, u.nickname AS user_nickname,
        u.avatar_url AS user_avatar_url, u.avatar_color AS user_avatar_color, u.role AS user_role
      FROM comments cm LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.target_type = 'case' AND cm.target_id = ?
      ORDER BY cm.created_at DESC
    `, [id]);

    const commentsData = comments.map((c: RowDataPacket) => ({
      id: c.id, user_id: c.user_id, target_type: c.target_type, target_id: c.target_id,
      content: c.content, created_at: c.created_at,
      user: {
        id: c.user_id, username: c.user_username, nickname: c.user_nickname,
        avatar_url: c.user_avatar_url, avatar_color: c.user_avatar_color, role: c.user_role,
      },
    }));

    await pool.query("UPDATE cases_ SET view_count = view_count + 1 WHERE id = ?", [id]);

    return NextResponse.json({
      case: caseData,
      bomItems: bomItems.map((b: RowDataPacket) => ({ ...b, unit_price: Number(b.unit_price) })),
      steps,
      resources,
      devLogs,
      comments: commentsData,
    });
  } catch (err) {
    console.error("Case detail error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
