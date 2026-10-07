import { GoogleGenAI } from "@google/genai";

/**
 * Sunucu tarafında Google GenAI istemcisini başlatan yardımcı fonksiyon.
 * API anahtarı yalnızca sunucuda (process.env.GEMINI_API_KEY) okunur.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ortam değişkeni tanımlı değil.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}
