import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { GEMINI_MODEL, TEKNO_MUHABIR_SYSTEM_INSTRUCTION } from "@/lib/talimat";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documents } = body;

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

    const prompt = `
YÜKLENEN TARİHÎ İNOVASYON BELGELERİ:
==================================
${formattedDocs}
==================================

GÖREV:
Yukarıdaki belgelerden hareketle "İnovasyonun İzinde: Fikirden Devrime" Teknoloji ve Tasarım dersi için bir GAZETE SAYFASI hazırla.
1919 dönemi gazete estetiğinden (İstiklal, Tasvir-i Efkâr, İrade-i Milliye ciddiyetinde) ilham alan, ancak 7-12. sınıf öğrencileri için modern teknoloji gazeteciliği dilinde bir içerik oluştur.

ZORUNLU ALANLAR VE KURALLAR:
1. gazeteAdi: Döneme ve teknoloji temasına uygun çarpıcı bir gazete başlığı (Örn: "İSTİKLÂL & FEN CERİDESİ" veya "TEKNO DEVRİM GAZETESİ").
2. sayiVeTarih: Gazete tarihi ve sayı ibaresi (Örn: "1919 Güz Dönemi / Sayı: 1 - Fikirden Devrime Özel Baskısı").
3. manset: Gazetenin ana manşeti. Büyük puntolu, heyecan verici ve belgelerdeki inovasyonu vurgulayan bir manşet.
4. spot: Manşetin altındaki 2-3 cümlelik vurucu özet giriş.
5. haberMetni: Ayrıntılı haber metni. Belgelerdeki teknik detayları, inovasyon adımlarını, zorlukları ve çözümleri 3. şahıs diliyle anlatan, yaklaşık 200-350 kelimelik gazete haberi. Her önemli bilginin sonunda dayandığı belgeyi [Belge 1], [Belge 2] gibi belirt.
6. inovasyonTuru: İnovasyon türünü açıkla (Örn: "Süreç İnovasyonu ve İletişim Teknolojisi" veya "Ürün Modifikasyonu & Lojistik İnovasyonu"). Neden bu tür olduğunu 1-2 cümleyle açıkla.
7. zamanCizelgesi: Belgelerde geçen olay ve tarihlerden çıkarılmış 3-4 maddelik kronolojik sıra (tarih ve olay).
8. alintilar: YALNIZCA BELGELERDEN VE BİREBİR ALINMIŞ, tırnak içinde aktarılan 2-3 adet tarihi söz/cümle. Asla uydurma söz yazma.
9. kontrolSorulari: 7-12. sınıf Teknoloji ve Tasarım dersinde öğrencilerin konuyu anlayıp anlamadığını ölçecek TAM 3 ADET çoktan seçmeli kontrol sorusu. Her sorunun soru metni, 4 seçeneği (A, B, C, D), doğru cevabı ve kısa pedagojik açıklaması olsun.

Tüm içerik Türkçe olmalıdır.
`.trim();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: TEKNO_MUHABIR_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gazeteAdi: { type: Type.STRING },
            sayiVeTarih: { type: Type.STRING },
            manset: { type: Type.STRING },
            spot: { type: Type.STRING },
            haberMetni: { type: Type.STRING },
            inovasyonTuru: { type: Type.STRING },
            zamanCizelgesi: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tarih: { type: Type.STRING },
                  olay: { type: Type.STRING },
                },
                required: ["tarih", "olay"],
              },
            },
            alintilar: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            kontrolSorulari: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  soru: { type: Type.STRING },
                  secenekler: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  dogruCevap: { type: Type.STRING },
                  aciklama: { type: Type.STRING },
                },
                required: ["soru", "secenekler", "dogruCevap", "aciklama"],
              },
            },
          },
          required: [
            "gazeteAdi",
            "sayiVeTarih",
            "manset",
            "spot",
            "haberMetni",
            "inovasyonTuru",
            "zamanCizelgesi",
            "alintilar",
            "kontrolSorulari",
          ],
        },
      },
    });

    const rawText = response.text?.trim() || "{}";
    const parsedData = JSON.parse(rawText);

    return NextResponse.json({
      newspaper: parsedData,
    });
  } catch (err: any) {
    console.error("Newspaper generation API error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Gazete sayfası hazırlanırken bir hata meydana geldi.",
      },
      { status: 500 }
    );
  }
}
