import { sql } from "@vercel/postgres";
import crypto from "crypto";

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface SavedProject {
  id: string;
  user_id: string;
  title: string;
  documents: any;
  newspaper_data: any;
  podcast_data: any;
  created_at: string;
  updated_at: string;
}

// Fallback bellek deposu: Vercel Postgres henüz bağlanmamışsa veya yerel test ortamında
// uygulamanın kesintisiz çalışması için kullanılır.
const memoryStore = {
  users: new Map<string, User>(),
  projects: new Map<string, SavedProject>(),
  initialized: false,
};

let dbInitialized = false;

/**
 * Vercel Postgres veritabanı tablolarını başlatır.
 */
export async function initDb(): Promise<boolean> {
  if (dbInitialized) return true;

  if (process.env.POSTGRES_URL) {
    try {
      // users tablosu
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // saved_projects tablosu
      await sql`
        CREATE TABLE IF NOT EXISTS saved_projects (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          documents JSONB NOT NULL,
          newspaper_data JSONB,
          podcast_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      dbInitialized = true;
      return true;
    } catch (err) {
      console.warn("Vercel Postgres tablosu oluşturulurken hata (bellek deposuna geçiliyor):", err);
      dbInitialized = true;
      return false;
    }
  }

  // POSTGRES_URL tanımlı değilse yerel depolama
  dbInitialized = true;
  return false;
}

// Şifre hashleme ve doğrulama yardımcı fonksiyonları
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Session Token oluşturma & doğrulama
const TOKEN_SECRET = process.env.AUTH_SECRET || "inovasyon-fikirden-devrime-gizli-anahtar-2026";

export function createSessionToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 gün
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(data)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.exp < Date.now()) return null;

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

// Veritabanı İşlemleri
export async function findUserByEmailOrUsername(
  identifier: string
): Promise<User | null> {
  await initDb();
  const lower = identifier.toLowerCase().trim();

  if (process.env.POSTGRES_URL) {
    try {
      const { rows } = await sql`
        SELECT * FROM users 
        WHERE LOWER(email) = ${lower} OR LOWER(username) = ${lower}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return rows[0] as User;
      }
      return null;
    } catch (err) {
      console.warn("Vercel Postgres sorgu hatası, bellek kontrol ediliyor:", err);
    }
  }

  // Bellek deposu
  for (const user of memoryStore.users.values()) {
    if (
      user.email.toLowerCase() === lower ||
      user.username.toLowerCase() === lower
    ) {
      return user;
    }
  }
  return null;
}

export async function findUserById(id: string): Promise<User | null> {
  await initDb();

  if (process.env.POSTGRES_URL) {
    try {
      const { rows } = await sql`
        SELECT * FROM users WHERE id = ${id} LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return rows[0] as User;
      }
      return null;
    } catch (err) {
      console.warn("Vercel Postgres sorgu hatası:", err);
    }
  }

  return memoryStore.users.get(id) || null;
}

export async function createUser(
  username: string,
  email: string,
  passwordHash: string
): Promise<User> {
  await initDb();
  const id = `usr_${crypto.randomUUID().replace(/-/g, "")}`;
  const now = new Date().toISOString();

  if (process.env.POSTGRES_URL) {
    try {
      await sql`
        INSERT INTO users (id, username, email, password_hash, created_at)
        VALUES (${id}, ${username}, ${email}, ${passwordHash}, ${now});
      `;
      return {
        id,
        username,
        email,
        password_hash: passwordHash,
        created_at: now,
      };
    } catch (err) {
      console.warn("Vercel Postgres insert hatası:", err);
    }
  }

  const user: User = {
    id,
    username,
    email,
    password_hash: passwordHash,
    created_at: now,
  };
  memoryStore.users.set(id, user);
  return user;
}

// Projeler
export async function getUserProjects(userId: string): Promise<SavedProject[]> {
  await initDb();

  if (process.env.POSTGRES_URL) {
    try {
      const { rows } = await sql`
        SELECT * FROM saved_projects 
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC;
      `;
      return rows as SavedProject[];
    } catch (err) {
      console.warn("Vercel Postgres projects sorgu hatası:", err);
    }
  }

  const list: SavedProject[] = [];
  for (const proj of memoryStore.projects.values()) {
    if (proj.user_id === userId) {
      list.push(proj);
    }
  }
  return list.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function saveProject(
  userId: string,
  title: string,
  documents: any,
  newspaperData: any,
  podcastData: any,
  existingProjectId?: string
): Promise<SavedProject> {
  await initDb();
  const id = existingProjectId || `prj_${crypto.randomUUID().replace(/-/g, "")}`;
  const now = new Date().toISOString();

  const docJson = JSON.stringify(documents);
  const newsJson = newspaperData ? JSON.stringify(newspaperData) : null;
  const podJson = podcastData ? JSON.stringify(podcastData) : null;

  if (process.env.POSTGRES_URL) {
    try {
      if (existingProjectId) {
        await sql`
          UPDATE saved_projects
          SET title = ${title},
              documents = ${docJson}::jsonb,
              newspaper_data = ${newsJson}::jsonb,
              podcast_data = ${podJson}::jsonb,
              updated_at = ${now}
          WHERE id = ${id} AND user_id = ${userId};
        `;
      } else {
        await sql`
          INSERT INTO saved_projects (id, user_id, title, documents, newspaper_data, podcast_data, created_at, updated_at)
          VALUES (
            ${id}, 
            ${userId}, 
            ${title}, 
            ${docJson}::jsonb, 
            ${newsJson}::jsonb, 
            ${podJson}::jsonb, 
            ${now}, 
            ${now}
          );
        `;
      }

      return {
        id,
        user_id: userId,
        title,
        documents,
        newspaper_data: newspaperData,
        podcast_data: podcastData,
        created_at: now,
        updated_at: now,
      };
    } catch (err) {
      console.warn("Vercel Postgres proje kayıt hatası:", err);
    }
  }

  const proj: SavedProject = {
    id,
    user_id: userId,
    title,
    documents,
    newspaper_data: newspaperData,
    podcast_data: podcastData,
    created_at: now,
    updated_at: now,
  };
  memoryStore.projects.set(id, proj);
  return proj;
}

export async function deleteProject(
  projectId: string,
  userId: string
): Promise<boolean> {
  await initDb();

  if (process.env.POSTGRES_URL) {
    try {
      await sql`
        DELETE FROM saved_projects WHERE id = ${projectId} AND user_id = ${userId};
      `;
      return true;
    } catch (err) {
      console.warn("Vercel Postgres proje silme hatası:", err);
    }
  }

  const proj = memoryStore.projects.get(projectId);
  if (proj && proj.user_id === userId) {
    memoryStore.projects.delete(projectId);
    return true;
  }
  return false;
}
