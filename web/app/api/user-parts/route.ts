import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json([]);

    const [parts] = await pool.query<RowDataPacket[]>(`
      SELECT up.*, p.name AS product_name, p.spec AS product_spec,
        p.price AS product_price, p.category_id AS product_category_id
      FROM user_parts up
      LEFT JOIN products p ON up.product_id = p.id
      WHERE up.user_id = ?
    `, [user.id]);

    return NextResponse.json(parts.map((pt) => ({
      ...pt,
      product: pt.product_name ? {
        id: pt.product_id, name: pt.product_name, spec: pt.product_spec,
        price: Number(pt.product_price), category_id: pt.product_category_id,
      } : null,
    })));
  } catch {
    return NextResponse.json([]);
  }
}
