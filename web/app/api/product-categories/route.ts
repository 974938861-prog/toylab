import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM product_categories ORDER BY sort_order"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Categories error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
