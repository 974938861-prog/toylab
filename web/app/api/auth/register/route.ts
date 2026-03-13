import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const AVATAR_COLORS = ["#7C3AED", "#059669", "#DC2626", "#D97706", "#0284C7", "#BE185D"];

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "邮箱或用户名已存在" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (email, password_hash, username, nickname, avatar_color) VALUES (?, ?, ?, ?, ?)",
      [email, hash, username, username, color]
    );

    const [newUser] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, username, nickname, avatar_url, avatar_color, bio, role FROM users WHERE email = ?",
      [email]
    );

    const user = newUser[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const res = NextResponse.json({ user });
    res.cookies.set("toylab_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
