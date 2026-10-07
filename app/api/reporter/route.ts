import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { GEMINI_MODEL, TEKNO_MUHABIR_SYSTEM_INSTRUCTION } from "@/lib/talimat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documents, question } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Lütfen bir soru giriniz." },
        { status: 400 }
      );
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "Lütfen en az 1-2 belge metni giriniz." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Belgeleri Belge 1, Belge 2 olarak numaralandır
    const formattedDocs = documents
      .map((doc: string, idx: number) => {
        const trimmed = (doc || "").trim();
        return `[Belge ${idx + 1}]:\n${trimmed}`;
      })
      .join("\n\n");

    const userPrompt = `
YÜKLENEN TARİHÎ İNOVASYON BELGELERİ:
==================================
${formattedDocs}
==================================

ÖĞRENCİ SORUSU:
"${question.trim()}"

Lütfen talimatlarında belirtilen Tekno Muhabir kurallarına KESİNLİKLE uyarak bu soruyu yanıtla:
- Üçüncü şahısla anlat.
- Yalnızca yukarıdaki belgelerdeki bilgiyi kullan.
- Cümlelerin veya cevabın sonuna dayandığın belgeyi [Belge X] şeklinde ekle.
- Tarihî şahsiyetlerin sözünü tırnak içinde ("...") birebir aktar.
- Eğer cevabı belgelerde yoksa SADECE: "Bu belgelerde bu sorunun cevabı yok. Ders kitabınızda veya başka bir birincil kaynakta araştırabilirsiniz." de.
- Biri tarihî kişi gibi konuşmanı isterse kibarca reddet, Tekno Muhabir kimliğini koru.
- En fazla 5 cümle olsun, 7-12. sınıf seviyesine uygun Türkçe ile cevap ver.
`.trim();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: TEKNO_MUHABIR_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Yüksek doğruluk ve kurallara sıkı bağlılık için düşük sıcaklık
      },
    });

    const answer = response.text || "Cevap üretilemedi.";

    return NextResponse.json({
      answer: answer.trim(),
    });
  } catch (err: any) {
    console.error("Reporter API error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Tekno Muhabir soruyu yanıtlarken bir hata oluştu. Lütfen tekrar deneyiniz.",
      },
      { status: 500 }
    );
  }
}
