import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import {
  GEMINI_MODEL,
  GEMINI_TTS_MODEL,
  TEKNO_MUHABIR_SYSTEM_INSTRUCTION,
} from "@/lib/talimat";
import { Type } from "@google/genai";

interface DialogueTurn {
  speaker: "Tekno Muhabir" | "Teknoloji Tarihçisi";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documents, newspaperData } = body;

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "Lütfen en az 1-2 belge metni giriniz." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const formattedDocs = documents
      .map((doc: string, idx: number) => {
        const trimmed = (doc || "").trim();
        return `[Belge ${idx + 1}]:\n${trimmed}`;
      })
      .join("\n\n");

    const newsContext = newspaperData
      ? `\nGAZETE BAŞLIĞI VE SPOT:\nManşet: ${newspaperData.manset || ""}\nSpot: ${newspaperData.spot || ""}\nİnovasyon Türü: ${newspaperData.inovasyonTuru || ""}`
      : "";

    // 1. AŞAMA: 1 Dakikalık Podcast Diyaloğu Üretimi
    const scriptPrompt = `
GÖREV:
"İnovasyonun İzinde: Fikirden Devrime" Teknoloji ve Tasarım dersi için "Tekno Muhabir" ve "Teknoloji Tarihçisi" arasında TAM 1 DAKİKALIK (yaklaşık 120-150 kelime, 6-8 karşılıklı konuşma turu) bir Türkçe podcast diyaloğu hazırla.

YÜKLENEN TARİHÎ İNOVASYON BELGELERİ:
==================================
${formattedDocs}
==================================
${newsContext}

RÖPORTAJ VE DİYALOG KURALLARI:
1. Konuşmacılar:
   - "Tekno Muhabir": Heyecanlı, meraklı bir teknoloji muhabiri. Programı açar, dinleyicilere selam verir, tarihçiye belgelerdeki inovasyonla ilgili sorular sorar ve programı kapatır.
   - "Teknoloji Tarihçisi": Bilge, sakin bir uzman. YALNIZCA BELGELERDEKİ BİLGİLERİ aktarır. Belgede yazmayan hiçbir şeyi eklemez. Belgedeki önemli sözleri birebir tırnak içinde aktarır ve dayandığı belgeyi [Belge 1] şeklinde belirtir.
2. Süre: Konuşma temposuna göre tam 1 dakikalık (kısa ve akıcı) olmalıdır.
3. Seviye: 7-12. sınıf öğrencileri için ilgi çekici, anlaşılır ve eğitici olmalıdır.
`.trim();

    const scriptResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: scriptPrompt,
      config: {
        systemInstruction: TEKNO_MUHABIR_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: {
                    type: Type.STRING,
                    description: "Tekno Muhabir veya Teknoloji Tarihçisi",
                  },
                  text: { type: Type.STRING },
                },
                required: ["speaker", "text"],
              },
            },
          },
          required: ["title", "summary", "dialogue"],
        },
      },
    });

    const parsedScript = JSON.parse(scriptResponse.text?.trim() || "{}");
    const dialogue: DialogueTurn[] = parsedScript.dialogue || [];
    const title = parsedScript.title || "İnovasyonun İzinde Podcast";
    const summary =
      parsedScript.summary ||
      "Tekno Muhabir ve Teknoloji Tarihçisi'nin 1 dakikalık inovasyon söyleşisi.";

    // 2. AŞAMA: Gemini TTS ile Seslendirme (Dual-Speaker & Fallback)
    let audioBase64: string | null = null;
    let ttsError: string | null = null;

    try {
      // Diyaloğu TTS parts formatına dönüştür
      // Speaker isimlerini "Muhabir" ve "Tarihçi" olarak eşle
      const ttsParts = dialogue.map((turn) => {
        const isMuhabir = turn.speaker.includes("Muhabir");
        const speakerKey = isMuhabir ? "Muhabir" : "Tarihçi";
        return {
          text: `${speakerKey}: ${turn.text}`,
          speechMetadata: {
            speaker: speakerKey,
            style: isMuhabir
              ? "Energetic, clear Turkish podcast host"
              : "Calm, authoritative Turkish historian",
          },
        };
      });

      // İki farklı ses: Puck (Muhabir) ve Kore (Tarihçi)
      const ttsResponse = await ai.models.generateContent({
        model: GEMINI_TTS_MODEL,
        contents: [
          {
            role: "user",
            parts: ttsParts,
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: "Muhabir",
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Puck" },
                  },
                },
                {
                  speaker: "Tarihçi",
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Kore" },
                  },
                },
              ],
            },
          },
        },
      });

      const audioData =
        ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        audioBase64 = audioData;
      }
    } catch (dualErr: any) {
      console.warn("Dual-speaker TTS failed, trying single-speaker fallback:", dualErr?.message);
      // Fallback: gemini-3.8-flash-lite-tts ile tek sesli anlatım
      try {
        const fullScriptText = dialogue
          .map((d) => `${d.speaker}: ${d.text}`)
          .join("\n\n");

        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: fullScriptText,
                  speechMetadata: {
                    style: "Clear Turkish educational podcast narrator",
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" },
              },
            },
          },
        });

        const fallbackAudio =
          fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (fallbackAudio) {
          audioBase64 = fallbackAudio;
        }
      } catch (singleErr: any) {
        console.warn("Single-speaker TTS fallback error:", singleErr?.message);
        ttsError = singleErr?.message || "Ses sentezleme tamamlanamadı.";
      }
    }

    return NextResponse.json({
      podcast: {
        title,
        summary,
        dialogue,
        audioBase64,
        ttsError,
      },
    });
  } catch (err: any) {
    console.error("Podcast generation error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Podcast üretilirken bir sorun oluştu. Lütfen tekrar deneyiniz.",
      },
      { status: 500 }
    );
  }
}
