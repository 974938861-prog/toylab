import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    const products = rows.map((r) => ({ ...r, price: Number(r.price) }));
    return NextResponse.json(products);
  } catch (err) {
    console.error("Products error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
