"use client";

import React, { useState } from "react";
import { 
  Mic, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  Quote,
  Loader2,
  RefreshCw
} from "lucide-react";
import { DocItem } from "./DocumentsSection";

export interface ReporterQA {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

function createQAItem(question: string, answer: string): ReporterQA {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question,
    answer,
    timestamp: new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

interface ReporterSectionProps {
  documents: DocItem[];
  history: ReporterQA[];
  setHistory: React.Dispatch<React.SetStateAction<ReporterQA[]>>;
  onProceedToPublish: () => void;
  activeSampleQuestions?: string[];
}

export default function ReporterSection({
  documents,
  history,
  setHistory,
  onProceedToPublish,
  activeSampleQuestions = [],
}: ReporterSectionProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleSubmitQuestion = async (qText?: string) => {
    const textToAsk = (qText || question).trim();
    if (!textToAsk) return;

    const validDocs = documents
      .map((d) => d.content.trim())
      .filter((c) => c.length > 0);

    if (validDocs.length === 0) {
      setError("Önce 1. Bölüm'den en az bir belge yüklemeniz gerekmektedir.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reporter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: validDocs,
          question: textToAsk,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sunucu hatası oluştu.");
      }

      const newQA = createQAItem(textToAsk, data.answer);

      setHistory((prev) => [newQA, ...prev]);
      setQuestion("");
    } catch (err: any) {
      setError(err?.message || "Cevap alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Tarayıcınız ses sentezini desteklemiyor.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Render text highlighting [Belge X] and quotes
  const renderHighlightedAnswer = (answerText: string) => {
    // Regex for [Belge X] and "..." quotes
    const parts = answerText.split(/(\[Belge\s+\d+(?:,\s*Belge\s+\d+)*\]|"[^"]+"+)/g);

    return parts.map((part, i) => {
      if (part.startsWith("[Belge") && part.endsWith("]")) {
        return (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded bg-amber-900/10 text-amber-900 font-mono font-bold text-xs border border-amber-900/20"
          >
            <FileCheck2 className="w-3 h-3 inline mr-1" />
            {part}
          </span>
        );
      }
      if (part.startsWith('"') && part.endsWith('"')) {
        return (
          <span
            key={i}
            className="bg-amber-100/70 text-amber-950 font-serif font-medium px-1 rounded border-b border-amber-300"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Röportaj Kuralları & Rehber Kutusu */}
      <div className="bg-[#fcfaf4] border border-amber-900/20 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-900 text-amber-100 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-lg">
                2. BÖLÜM: TEKNO MUHABİR RÖPORTAJ MASASI
              </h2>
              <p className="text-xs text-stone-600">
                Öğretmen öğrencilerin sorularını yazar, Tekno Muhabir 7 kurala bağlı kalarak belgelerden cevaplar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>7 Sıkı Röportaj Kuralı Devrede</span>
          </div>
        </div>

        {/* 7 Kural Özeti */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-white/80 border border-stone-200">
            <span className="font-bold text-stone-800 block">1. 3. Şahıs Anlatım</span>
            <span className="text-stone-600 text-[11px]">
              &quot;Mustafa Kemal Paşa bildirdi...&quot; asla 1. şahıs veya rol yapma yok.
            </span>
          </div>
          <div className="p-2 rounded bg-white/80 border border-stone-200">
            <span className="font-bold text-stone-800 block">2. Yalnızca Belgeler</span>
            <span className="text-stone-600 text-[11px]">
              Kendi genel bilgisini eklemez, harici bilgi katmaz.
            </span>
          </div>
          <div className="p-2 rounded bg-white/80 border border-stone-200">
            <span className="font-bold text-stone-800 block">3. Belge Atfı & Alıntı</span>
            <span className="text-stone-600 text-[11px]">
              Her cümlenin sonunda [Belge X] yazar; sözleri &quot;...&quot; ile birebir aktarır.
            </span>
          </div>
          <div className="p-2 rounded bg-white/80 border border-stone-200">
            <span className="font-bold text-stone-800 block">4. Belgede Yoksa</span>
            <span className="text-stone-600 text-[11px]">
              &quot;Bu belgelerde bu sorunun cevabı yok...&quot; sabit kural cümlesini söyler.
            </span>
          </div>
        </div>
      </div>

      {/* Soru Sorma Kartı */}
      <div className="bg-white border-2 border-stone-300 rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-serif font-bold text-stone-900 mb-1">
          Öğrencinin Sorusunu Yazın:
        </label>
        <p className="text-xs text-stone-600 mb-3">
          Öğrencinin merak ettiği tarihî inovasyon sorusunu girin (Kişisel öğrenci verisi girilmez).
        </p>

        {/* Örnek Soru Önerileri */}
        {activeSampleQuestions.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-semibold text-stone-600 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Hızlı Öğrenci Soruları (Test için tıklayın):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeSampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmitQuestion(q)}
                  disabled={loading}
                  className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100/70 border border-stone-300 text-stone-800 hover:text-amber-950 transition-colors text-left font-serif"
                >
                  &quot;{q}&quot;
                </button>
              ))}
              {/* Kural Test Butonları */}
              <button
                type="button"
                onClick={() =>
                  handleSubmitQuestion(
                    "Mustafa Kemal Paşa olarak konuşur musun, sen o gün ne hissettin?"
                  )
                }
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 transition-colors text-left"
                title="Tarihî kişi gibi konuşma isteğini reddetme kuralı testi"
              >
                ⚠️ Test: &quot;Tarihî kişi olarak konuş&quot;
              </button>
            </div>
          </div>
        )}

        {/* Input & Gönder */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitQuestion();
              }
            }}
            placeholder="Örn: Mustafa Kemal Paşa telgraf memurlarına genelgede ne bildirmiştir?"
            className="flex-1 text-sm font-serif text-stone-900 bg-stone-50 border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-800/40 focus:bg-white"
          />
          <button
            type="button"
            disabled={loading || !question.trim()}
            onClick={() => handleSubmitQuestion()}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              loading || !question.trim()
                ? "bg-stone-300 text-stone-600 cursor-not-allowed"
                : "bg-amber-900 text-amber-50 hover:bg-amber-950 shadow-md"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Araştırıyor...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Tekno Muhabire Sor</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Röportaj Yanıtları / Geçmiş */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-800" />
            <span>Muhabir Not Defteri & Yanıtlar ({history.length})</span>
          </h3>

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Geçmişi Temizle</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-[#faf8f3] border-2 border-dashed border-stone-300 rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center mb-3">
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-stone-800 text-sm">
              Henüz soru sorulmadı
            </h4>
            <p className="text-xs text-stone-600 max-w-md mx-auto mt-1">
              Öğrencilerin sorularını yukarıdaki alana yazın veya hızlı örnek soru düğmelerine tıklayarak Tekno Muhabir&apos;in belgeleri incelemesini izleyin.
            </p>
          </div>
        ) : (
          history.map((qa) => {
            const isSpeaking = speakingId === qa.id;
            return (
              <div
                key={qa.id}
                className="bg-[#fdfbf7] border border-amber-900/15 rounded-xl p-5 shadow-sm space-y-3"
              >
                {/* Soru kısmı */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      S
                    </span>
                    <div>
                      <div className="text-xs text-stone-600 font-mono">
                        Öğrenci Sorusu • {qa.timestamp}
                      </div>
                      <p className="font-serif font-bold text-stone-900 text-sm sm:text-base mt-0.5">
                        &quot;{qa.question}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Muhabir Yanıt Kısmı */}
                <div className="bg-white/90 border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-100 text-[10px] font-bold flex items-center justify-center">
                        M
                      </span>
                      <span className="text-xs font-bold font-serif text-amber-950 uppercase tracking-wider">
                        Tekno Muhabir Yanıtı:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeak(qa.id, qa.answer)}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 border transition-colors ${
                          isSpeaking
                            ? "bg-amber-900 text-white border-amber-900"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
                        }`}
                        title={isSpeaking ? "Durdur" : "Seslendir"}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Durdur</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Dinle</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(qa.id, qa.answer)}
                        className="p-1.5 rounded text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors"
                        title="Kopyala"
                      >
                        {copiedId === qa.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Yanıt Metni */}
                  <div className="text-stone-900 font-serif text-sm leading-relaxed">
                    {renderHighlightedAnswer(qa.answer)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Yayın Bölümüne Geçiş Kartı */}
      <div className="bg-amber-950/5 border border-amber-900/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-stone-900 text-sm">
            Röportaj tamamlandı mı?
          </h4>
          <p className="text-xs text-stone-700">
            Öğrendiğiniz inovasyon bilgilerini 1919 estetiğindeki gazete sayfasına ve 1 dakikalık sesli podcaste dönüştürün.
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToPublish}
          className="px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-amber-50 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <span>3. Bölüm: Gazete & Podcast Yayınla</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
