import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifySessionToken,
  getUserProjects,
  saveProject,
  deleteProject,
} from "@/lib/db";

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("inovasyon_session")?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  return payload?.userId || null;
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    const projects = await getUserProjects(userId);
    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Projeler yüklenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Projeyi kaydetmek için lütfen giriş yapınız." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, documents, newspaperData, podcastData, projectId } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Lütfen bir proje başlığı giriniz." },
        { status: 400 }
      );
    }

    const saved = await saveProject(
      userId,
      title.trim(),
      documents,
      newspaperData,
      podcastData,
      projectId
    );

    return NextResponse.json({ project: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Proje kaydedilemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json(
        { error: "Proje kimliği gereklidir." },
        { status: 400 }
      );
    }

    const ok = await deleteProject(projectId, userId);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Proje silinemedi." },
      { status: 500 }
    );
  }
}
