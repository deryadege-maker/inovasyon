import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createUser,
  findUserByEmailOrUsername,
  hashPassword,
  createSessionToken,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // Doğrulama
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Kullanıcı adı en az 3 karakter olmalıdır." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter uzunluğunda olmalıdır." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Kullanıcı mevcut mu?
    const existing = await findUserByEmailOrUsername(cleanUsername);
    if (existing) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      );
    }

    const existingEmail = await findUserByEmailOrUsername(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: "Bu e-posta adresi ile zaten bir hesap açılmış." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = await createUser(cleanUsername, cleanEmail, passwordHash);

    // Oturum anahtarı oluştur ve çereze yaz
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
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err?.message || "Kayıt işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
