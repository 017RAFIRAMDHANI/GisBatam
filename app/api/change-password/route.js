import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcrypt";
import pool from "../../lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak valid. Silakan login ulang.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const oldPassword = body?.oldPassword;
    const newPassword = body?.newPassword;
    const confirmPassword = body?.confirmPassword;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password lama, password baru, dan ulangi password wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru minimal 6 karakter.",
        },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru dan ulangi password tidak sama.",
        },
        { status: 400 },
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru tidak boleh sama dengan password lama.",
        },
        { status: 400 },
      );
    }

    const userResult = await pool.query(
      `
      SELECT id, password_hash, is_active
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [session.user.id],
    );

    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (user.is_active === false) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak aktif.",
        },
        { status: 403 },
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        {
          success: false,
          message: "Password user belum tersedia di database.",
        },
        { status: 400 },
      );
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );

    if (!isOldPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Password lama salah.",
        },
        { status: 400 },
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
      `
      UPDATE users
      SET password_hash = $1,
          update_at = NOW()
      WHERE id = $2
      `,
      [newPasswordHash, session.user.id],
    );

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah. Silakan login ulang.",
    });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server saat mengubah password.",
      },
      { status: 500 },
    );
  }
}
