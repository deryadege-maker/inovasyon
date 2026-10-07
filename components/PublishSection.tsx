"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Newspaper, 
  Headphones, 
  Play, 
  Pause, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  Quote, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Volume2, 
  Mic, 
  BookOpen, 
  Loader2, 
  AlertCircle
} from "lucide-react";
import { DocItem } from "./DocumentsSection";

export interface NewspaperData {
  gazeteAdi: string;
  sayiVeTarih: string;
  manset: string;
  spot: string;
  haberMetni: string;
  inovasyonTuru: string;
  zamanCizelgesi: { tarih: string; olay: string }[];
  alintilar: string[];
  kontrolSorulari: {
    soru: string;
    secenekler: string[];
    dogruCevap: string;
    aciklama: string;
  }[];
}

export interface PodcastData {
  title: string;
  summary: string;
  dialogue: { speaker: string; text: string }[];
  audioBase64: string | null;
  ttsError?: string | null;
}

interface PublishSectionProps {
  documents: DocItem[];
  newspaperData: NewspaperData | null;
  setNewspaperData: React.Dispatch<React.SetStateAction<NewspaperData | null>>;
  podcastData: PodcastData | null;
  setPodcastData: React.Dispatch<React.SetStateAction<PodcastData | null>>;
}

export default function PublishSection({
  documents,
  newspaperData,
  setNewspaperData,
  podcastData,
  setPodcastData,
}: PublishSectionProps) {
  const [activeTab, setActiveTab] = useState<"newspaper" | "podcast">(
    newspaperData ? "newspaper" : "newspaper"
  );
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingPodcast, setLoadingPodcast] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [podcastError, setPodcastError] = useState<string | null>(null);

  // Gazete etkileşimleri
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: string }>({});
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);
  const [copiedNews, setCopiedNews] = useState(false);

  // Podcast audio oynatıcı kontrolleri
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  const validDocs = documents
    .map((d) => d.content.trim())
    .filter((c) => c.length > 0);

  // 1. Gazete Sayfası Yap
  const handleGenerateNewspaper = async () => {
    if (validDocs.length === 0) {
      setNewsError("Lütfen önce 1. Bölüm'de belgeleri doldurunuz.");
      return;
    }

    setLoadingNews(true);
    setNewsError(null);

    try {
      const res = await fetch("/api/newspaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: validDocs }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gazete sayfası hazırlanamadı.");
      }

      setNewspaperData(data.newspaper);
      setActiveTab("newspaper");
      setSelectedAnswers({});
      setShowAnswerKeys(false);
    } catch (err: any) {
      setNewsError(err?.message || "Gazete sayfası üretilirken bir hata oluştu.");
    } finally {
      setLoadingNews(false);
    }
  };

  // 2. Podcast Yap
  const handleGeneratePodcast = async () => {
    if (validDocs.length === 0) {
      setPodcastError("Lütfen önce 1. Bölüm'de belgeleri doldurunuz.");
      return;
    }

    setLoadingPodcast(true);
    setPodcastError(null);

    try {
      const res = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: validDocs,
          newspaperData: newspaperData || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Podcast hazırlanamadı.");
      }

      setPodcastData(data.podcast);
      setActiveTab("podcast");
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (err: any) {
      setPodcastError(err?.message || "Podcast üretilirken bir hata oluştu.");
    } finally {
      setLoadingPodcast(false);
    }
  };

  // Ses oynatma dinleyicileri
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (podcastData?.dialogue && podcastData.dialogue.length > 0) {
        const totalTurns = podcastData.dialogue.length;
        const dur = audio.duration || 60;
        const turnIdx = Math.min(
          totalTurns - 1,
          Math.floor((audio.currentTime / dur) * totalTurns)
        );
        setCurrentTurnIndex(turnIdx);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTurnIndex(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [podcastData]);

  const togglePlayPodcast = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn("Audio play prevented:", e);
      });
    }
  };

  const handleSpeedChange = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleDownloadWav = () => {
    if (!podcastData?.audioBase64) return;
    const link = document.createElement("a");
    link.href = `data:audio/wav;base64,${podcastData.audioBase64}`;
    link.download = `Inovasyonun_Izinde_Podcast.wav`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNewspaper = () => {
    if (!newspaperData) return;
    const text = `
${newspaperData.gazeteAdi}
${newspaperData.sayiVeTarih}
MANŞET: ${newspaperData.manset}
SPOT: ${newspaperData.spot}

İNOVASYON TÜRÜ:
${newspaperData.inovasyonTuru}

HABER METNİ:
${newspaperData.haberMetni}

TARİHÎ ALINTILAR:
${newspaperData.alintilar.map((a) => `- "${a}"`).join("\n")}

ZAMAN ÇİZELGESİ:
${newspaperData.zamanCizelgesi.map((z) => `${z.tarih}: ${z.olay}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedNews(true);
    setTimeout(() => setCopiedNews(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* 2 Temel Aksiyon Düğmesi: Gazete Sayfası Yap ve Podcast Yap */}
      <div className="bg-[#fcfaf4] border-2 border-amber-900/20 rounded-xl p-5 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-900/10">
          <div>
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
              3. BÖLÜM: YAYIN STÜDYOSU
            </span>
            <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
              Tarihî İnovasyonu Yayına Hazırlayın
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-serif mt-0.5">
              Belgelerden 1919 estetiğinde bir gazete sayfası mizanpajı üretin ve Tekno Muhabir ile Tarihçi arasında sesli bir podcast oluşturun.
            </p>
          </div>

          {/* Aksiyon Düğmeleri */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={loadingNews || validDocs.length === 0}
              onClick={handleGenerateNewspaper}
              className={`px-5 py-3 rounded-lg text-sm font-serif font-bold flex items-center gap-2.5 transition-all shadow-md ${
                loadingNews || validDocs.length === 0
                  ? "bg-stone-300 text-stone-600 cursor-not-allowed"
                  : "bg-amber-900 text-amber-50 hover:bg-amber-950 active:scale-[0.99]"
              }`}
            >
              {loadingNews ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gazete Basılıyor...</span>
                </>
              ) : (
                <>
                  <Newspaper className="w-5 h-5" />
                  <span>Gazete Sayfası Yap</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loadingPodcast || validDocs.length === 0}
              onClick={handleGeneratePodcast}
              className={`px-5 py-3 rounded-lg text-sm font-serif font-bold flex items-center gap-2.5 transition-all shadow-md ${
                loadingPodcast || validDocs.length === 0
                  ? "bg-stone-300 text-stone-600 cursor-not-allowed"
                  : "bg-stone-800 text-stone-50 hover:bg-stone-900 active:scale-[0.99]"
              }`}
            >
              {loadingPodcast ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Podcast Seslendiriliyor...</span>
                </>
              ) : (
                <>
                  <Headphones className="w-5 h-5 text-amber-300" />
                  <span>Podcast Yap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sekme Değiştirici */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("newspaper")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === "newspaper"
                  ? "bg-amber-900/10 text-amber-950 font-bold border border-amber-900/30"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Newspaper className="w-4 h-4 text-amber-900" />
              <span>1919 Teknoloji Gazetesi</span>
              {newspaperData && (
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("podcast")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === "podcast"
                  ? "bg-amber-900/10 text-amber-950 font-bold border border-amber-900/30"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Headphones className="w-4 h-4 text-amber-900" />
              <span>1 Dakikalık Podcast Stüdyosu</span>
              {podcastData && (
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              )}
            </button>
          </div>

          {activeTab === "newspaper" && newspaperData && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                title="Yazdır veya PDF olarak kaydet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Sayfayı Yazdır / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCopyNewspaper}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {copiedNews ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Hata Bildirimleri */}
        {newsError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{newsError}</span>
          </div>
        )}
        {podcastError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{podcastError}</span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. GAZETE SAYFASI MİZANPAJI (1919 Estetiği + Modern Teknoloji) */}
      {/* ============================================================== */}
      {activeTab === "newspaper" && (
        <div>
          {!newspaperData ? (
            <div className="bg-[#faf8f3] border-2 border-dashed border-stone-300 rounded-2xl p-12 text-center no-print">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center mb-4 shadow-sm border border-amber-200">
                <Newspaper className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Gazete Henüz Basılmadı
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto mt-2 font-serif">
                Yukarıdaki <strong>&quot;Gazete Sayfası Yap&quot;</strong> butonuna tıklayarak belgelerinizden 1919 estetiğinde manşet, haber metni, zaman çizelgesi, alıntılar ve 3 kontrol sorusu içeren tam bir gazete sayfası oluşturun.
              </p>
              <button
                type="button"
                onClick={handleGenerateNewspaper}
                disabled={loadingNews || validDocs.length === 0}
                className="mt-5 px-6 py-2.5 bg-amber-900 text-amber-50 rounded-lg text-sm font-semibold hover:bg-amber-950 transition-all shadow-md inline-flex items-center gap-2"
              >
                {loadingNews ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Hemen Gazete Sayfası Yap</span>
              </button>
            </div>
          ) : (
            <article className="print-newspaper bg-[#fbf8ef] border-4 border-stone-800 rounded-none shadow-2xl p-6 sm:p-10 max-w-5xl mx-auto text-stone-900 relative">
              {/* Gazete Üst Bordürü */}
              <div className="border-b-4 border-stone-900 pb-4 mb-6">
                {/* Künye / Tarih Şeridi */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-widest border-b border-stone-800 pb-1 mb-3">
                  <span>{newspaperData.sayiVeTarih}</span>
                  <span className="font-bold text-center">
                    MİLLÎ İNOVASYON & TASARIM KÜLLİYATI
                  </span>
                  <span>Fiyatı: 20 Kuruş / Fikirden Devrime</span>
                </div>

                {/* Gazete Ana Başlığı (Masthead) */}
                <div className="text-center py-2">
                  <div className="text-xs tracking-[0.3em] uppercase text-stone-700 font-serif mb-1">
                    — TEKNOLOJİ VE TASARIM DERSİ TARİHÎ BÜLTENİ —
                  </div>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-stone-950 uppercase border-y-2 border-stone-900 py-2">
                    {newspaperData.gazeteAdi}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-xs font-serif italic text-stone-700 mt-2">
                    <span>&quot;İstiklâl fen ile, fen inovasyon ile kaimdir.&quot;</span>
                    <span>•</span>
                    <span>Hakiki Birincil Kaynaklardan İktibas Olunmuştur</span>
                  </div>
                </div>
              </div>

              {/* Manşet ve Spot Bölümü */}
              <div className="mb-8 border-b-2 border-stone-800 pb-6 text-center max-w-4xl mx-auto">
                {/* İnovasyon Türü Etiketi */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950 text-amber-100 text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>İnovasyon Türü: {newspaperData.inovasyonTuru}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif font-black text-stone-950 leading-tight tracking-tight uppercase">
                  {newspaperData.manset}
                </h2>

                <p className="mt-3 text-base sm:text-lg font-serif italic text-stone-800 max-w-3xl mx-auto leading-relaxed border-t border-stone-300 pt-3">
                  {newspaperData.spot}
                </p>
              </div>

              {/* Ana Gövde: Sütunlu Haber Metni ve Yan Paneller */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Sol 2 Sütun: Ayrıntılı Haber Metni */}
                <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-stone-400 lg:pr-8">
                  <div className="flex items-center justify-between pb-2 mb-4 border-b border-stone-800">
                    <span className="font-serif font-bold text-xs uppercase tracking-wider">
                      Haber Masası Özel Raporu
                    </span>
                    <span className="font-mono text-[11px] text-stone-600">
                      Tekno Muhabir İncelemesi
                    </span>
                  </div>

                  <div className="newspaper-columns-2 text-justify font-serif text-stone-900 text-sm leading-relaxed space-y-3">
                    {newspaperData.haberMetni.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx} className="first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Tarihî Birebir Alıntılar Kutusu */}
                  <div className="mt-6 p-4 bg-[#f4ede0] border-2 border-stone-800 rounded-none">
                    <div className="flex items-center gap-1.5 font-serif font-bold text-stone-950 text-xs uppercase tracking-wider mb-2">
                      <Quote className="w-4 h-4 text-amber-900" />
                      <span>Belgelerden Birebir Alıntılar:</span>
                    </div>
                    <ul className="space-y-2 text-xs font-serif text-stone-900 italic">
                      {newspaperData.alintilar.map((alinti, aIdx) => (
                        <li key={aIdx} className="border-l-2 border-amber-900 pl-2.5">
                          &quot;{alinti.replace(/^"|"$/g, "")}&quot;
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sağ 1 Sütun: Zaman Çizelgesi ve İnovasyon Çözümlemesi */}
                <div className="space-y-6">
                  {/* Zaman Çizelgesi */}
                  <div className="border border-stone-800 p-4 bg-white/60">
                    <div className="flex items-center gap-2 font-serif font-bold text-stone-950 text-xs uppercase tracking-wider border-b border-stone-800 pb-2 mb-3">
                      <Clock className="w-4 h-4 text-amber-900" />
                      <span>Kronolojik İnovasyon Çizelgesi</span>
                    </div>

                    <div className="relative pl-4 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-400">
                      {newspaperData.zamanCizelgesi.map((zc, zIdx) => (
                        <div key={zIdx} className="relative">
                          <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-stone-900 border-2 border-amber-100"></span>
                          <span className="font-mono text-xs font-bold text-amber-950 block">
                            {zc.tarih}
                          </span>
                          <p className="font-serif text-xs text-stone-800 mt-0.5">
                            {zc.olay}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arşiv Damgası */}
                  <div className="p-4 border-2 border-dashed border-stone-400 text-center font-serif">
                    <div className="w-12 h-12 rounded-full border-2 border-red-900 text-red-900 flex items-center justify-center font-bold text-[10px] mx-auto uppercase rotate-[-12deg] mb-2 tracking-tighter">
                      1919 ONAY
                    </div>
                    <p className="text-[11px] text-stone-700 leading-tight">
                      &quot;Yalnızca doğrulanmış birincil belgeler neşredilmiştir. Hayali malumat men edilmiştir.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Alt Bölüm: 3 Kontrol Sorusu (Teknoloji ve Tasarım Dersi Ölçme-Değerlendirme) */}
              <div className="border-t-4 border-stone-900 pt-6 mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-amber-900 font-bold block">
                      DERS İÇİ DEĞERLENDİRME & KAVRAMA
                    </span>
                    <h3 className="font-serif font-bold text-stone-950 text-base sm:text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-900" />
                      <span>7-12. Sınıf Kontrol Soruları (3 Soru)</span>
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                    className="no-print px-3 py-1.5 rounded text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors self-start sm:self-auto"
                  >
                    {showAnswerKeys ? "Cevap Anahtarını Gizle" : "Cevap Anahtarını Göster"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {newspaperData.kontrolSorulari.map((item, qIdx) => {
                    const chosen = selectedAnswers[qIdx];

                    return (
                      <div
                        key={qIdx}
                        className="bg-white/80 border border-stone-800 p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-1 mb-2 border-b border-stone-300 text-xs font-mono font-bold text-stone-800">
                            <span>Soru #{qIdx + 1}</span>
                          </div>
                          <p className="font-serif font-bold text-stone-950 text-xs mb-3 leading-snug">
                            {item.soru}
                          </p>

                          <div className="space-y-1.5">
                            {item.secenekler.map((opt, oIdx) => {
                              const isSelected = chosen === opt;
                              const isKey = item.dogruCevap === opt && showAnswerKeys;

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() =>
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [qIdx]: opt,
                                    }))
                                  }
                                  className={`w-full text-left text-xs p-2 rounded transition-all font-serif flex items-start gap-1.5 ${
                                    isSelected
                                      ? "bg-amber-900 text-white font-medium"
                                      : isKey
                                      ? "bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold"
                                      : "bg-stone-100 hover:bg-stone-200 text-stone-900"
                                  }`}
                                >
                                  <span className="shrink-0">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Cevap Anahtarı ve Açıklama */}
                        {showAnswerKeys && (
                          <div className="mt-3 pt-2 border-t border-stone-300 text-[11px] text-stone-800">
                            <div className="font-bold text-emerald-900 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Doğru: {item.dogruCevap}</span>
                            </div>
                            <p className="text-stone-600 mt-0.5 italic">
                              {item.aciklama}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alt Bilgi */}
              <div className="border-t-2 border-stone-800 mt-8 pt-3 text-center text-[11px] font-mono text-stone-600 flex items-center justify-between flex-wrap gap-2">
                <span>Teknoloji ve Tasarım Dersi &quot;İnovasyonun İzinde&quot; Projesi</span>
                <span>© 1919-Modern / AI Studio & Gemini 3.8 Flash</span>
                <span>T.C. Millî Eğitim Müfredatı Uyumlu</span>
              </div>
            </article>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PODCAST STÜDYOSU (Tekno Muhabir & Teknoloji Tarihçisi)      */}
      {/* ============================================================== */}
      {activeTab === "podcast" && (
        <div>
          {!podcastData ? (
            <div className="bg-[#faf8f3] border-2 border-dashed border-stone-300 rounded-2xl p-12 text-center no-print">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center mb-4 shadow-sm border border-amber-200">
                <Headphones className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Podcast Henüz Hazırlanmadı
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto mt-2 font-serif">
                Yukarıdaki <strong>&quot;Podcast Yap&quot;</strong> düğmesine tıklayarak Tekno Muhabir ve Teknoloji Tarihçisi arasında 1 dakikalık sesli bir diyalog oluşturun (Gemini TTS ile Türkçe iki farklı hazır ses).
              </p>
              <button
                type="button"
                onClick={handleGeneratePodcast}
                disabled={loadingPodcast || validDocs.length === 0}
                className="mt-5 px-6 py-2.5 bg-stone-900 text-stone-50 rounded-lg text-sm font-semibold hover:bg-stone-950 transition-all shadow-md inline-flex items-center gap-2"
              >
                {loadingPodcast ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Headphones className="w-4 h-4 text-amber-300" />
                )}
                <span>Hemen Podcast Yap</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#fcfaf4] border-2 border-amber-900/20 rounded-2xl p-6 sm:p-8 shadow-lg max-w-4xl mx-auto space-y-6">
              {/* Gizli Audio Etiketi */}
              {podcastData.audioBase64 && (
                <audio
                  ref={audioRef}
                  src={`data:audio/wav;base64,${podcastData.audioBase64}`}
                  preload="metadata"
                />
              )}

              {/* Podcast Başlık & Oynatıcı Kartı */}
              <div className="bg-stone-900 text-stone-100 rounded-xl p-6 shadow-md border border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
                      <Mic className="w-3.5 h-3.5" />
                      <span>1 Dakikalık Sesli İnovasyon Podcasti</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold mt-1 text-white">
                      {podcastData.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl font-serif">
                      {podcastData.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {podcastData.audioBase64 && (
                      <button
                        type="button"
                        onClick={handleDownloadWav}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono flex items-center gap-1.5 border border-stone-700 transition-colors"
                        title="WAV Ses Dosyasını İndir"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>WAV İndir</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Audio Oynatıcı Kontrolleri */}
                <div className="mt-5 pt-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={togglePlayPodcast}
                      className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-stone-950" />
                      ) : (
                        <Play className="w-6 h-6 fill-stone-950 ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      {/* İlerleme Çubuğu */}
                      <input
                        type="range"
                        min={0}
                        max={duration || 60}
                        value={currentTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCurrentTime(val);
                          if (audioRef.current) {
                            audioRef.current.currentTime = val;
                          }
                        }}
                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                        <span>{formatSeconds(currentTime)}</span>
                        <div className="flex items-center gap-2">
                          {isPlaying && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                              <span>Canlı Yayın</span>
                            </span>
                          )}
                          <span>{formatSeconds(duration || 60)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSpeedChange}
                      className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-mono font-bold border border-stone-700 shrink-0"
                      title="Oynatma hızı"
                    >
                      {playbackRate}x
                    </button>
                  </div>
                </div>
              </div>

              {/* Konuşmacı Bilgi Şeridi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-amber-900/10 border border-amber-900/20 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-xs shrink-0">
                    TM
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Tekno Muhabir (Puck Sesi)</span>
                    <span className="text-stone-600 text-[11px]">
                      Program sunucusu, dinamik ve soruları yönelten araştırmacı.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-200/70 border border-stone-300 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-bold text-xs shrink-0">
                    TT
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Teknoloji Tarihçisi (Kore Sesi)</span>
                    <span className="text-stone-600 text-[11px]">
                      Yalnızca birincil belgelerdeki bilgileri ve alıntıları aktaran uzman.
                    </span>
                  </div>
                </div>
              </div>

              {/* Transkript / Karşılıklı Diyalog Görünümü */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                    <span>Podcast Metni & Canlı Diyalog Akışı</span>
                  </h4>
                  <span className="text-xs text-stone-600 font-mono">
                    {podcastData.dialogue.length} Karşılıklı Tur
                  </span>
                </div>

                <div className="space-y-2.5">
                  {podcastData.dialogue.map((turn, tIdx) => {
                    const isMuhabir = turn.speaker.includes("Muhabir");
                    const isCurrent = isPlaying && currentTurnIndex === tIdx;

                    return (
                      <div
                        key={tIdx}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? "ring-2 ring-amber-500 bg-amber-50/90 shadow-md border-amber-400"
                            : isMuhabir
                            ? "bg-white/90 border-amber-900/15"
                            : "bg-[#f5f0e6]/70 border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                                isMuhabir
                                  ? "bg-amber-900 text-amber-100"
                                  : "bg-stone-800 text-stone-100"
                              }`}
                            >
                              {turn.speaker}
                            </span>
                            {isCurrent && (
                              <span className="text-[11px] text-amber-800 font-bold animate-pulse flex items-center gap-1 font-sans">
                                <Volume2 className="w-3.5 h-3.5" /> Konuşuyor
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-600 font-mono">
                            Tur #{tIdx + 1}
                          </span>
                        </div>

                        <p className="font-serif text-sm text-stone-900 leading-relaxed pl-1">
                          {turn.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
