import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  findUserByEmailOrUsername,
  verifyPassword,
  createSessionToken,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { error: "Kullanıcı adı veya e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Lütfen şifrenizi giriniz." },
        { status: 400 }
      );
    }

    const user = await findUserByEmailOrUsername(identifier.trim());
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı adı/e-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Kullanıcı adı/e-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set("inovasyon_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err?.message || "Giriş işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
