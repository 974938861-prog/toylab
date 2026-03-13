import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ user: null });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, username, nickname, avatar_url, avatar_color, bio, role, created_at, updated_at FROM users WHERE id = ?",
      [tokenUser.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: rows[0] });
  } catch {
    return NextResponse.json({ user: null });
  }
}
