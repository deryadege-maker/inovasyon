"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import DocumentsSection, { DocItem } from "@/components/DocumentsSection";
import ReporterSection, { ReporterQA } from "@/components/ReporterSection";
import PublishSection, { NewspaperData, PodcastData } from "@/components/PublishSection";
import { SAMPLE_DOCUMENT_SETS } from "@/lib/sample-documents";
import { 
  FileText, 
  Mic, 
  Newspaper, 
  Lightbulb, 
  Compass
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"belgeler" | "muhabir" | "yayin">("belgeler");

  // Varsayılan olarak 1919 Telgraf İnovasyonu belgeleriyle başlatılır
  const initialSet = SAMPLE_DOCUMENT_SETS[0];
  const [documents, setDocuments] = useState<DocItem[]>(
    initialSet.documents.map((d, index) => ({
      id: `belge-${index + 1}`,
      label: `Belge ${index + 1}`,
      title: d.title,
      content: d.content,
    }))
  );

  const [reporterHistory, setReporterHistory] = useState<ReporterQA[]>([]);
  const [newspaperData, setNewspaperData] = useState<NewspaperData | null>(null);
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);

  // Güncel aktif belge kümesine ait örnek sorular
  const currentSampleQuestions =
    SAMPLE_DOCUMENT_SETS.find((s) =>
      documents[0]?.content.includes("Mustafa Kemal") ||
      documents[0]?.title.includes("Telgraf")
    )?.suggestedQuestions || SAMPLE_DOCUMENT_SETS[0].suggestedQuestions;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f3] text-stone-900 font-sans selection:bg-amber-900 selection:text-white">
      {/* Üst Gezinme ve Başlık Çubuğu */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentCount={documents.length}
        hasNewspaper={!!newspaperData}
        hasPodcast={!!podcastData}
      />

      {/* Hero Bölümü (Yalnızca ilk sekmede zarifçe sergilenir) */}
      {activeTab === "belgeler" && (
        <section className="bg-gradient-to-b from-[#f5f0e6] to-[#faf8f3] border-b border-amber-900/10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-900 text-xs font-semibold uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Teknoloji ve Tasarım Dersi Dijital İnovasyon Laboratuvarı</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-stone-950 tracking-tight">
              İnovasyonun İzinde: Fikirden Devrime
            </h2>

            <p className="text-sm sm:text-base text-stone-700 font-serif max-w-3xl mx-auto leading-relaxed">
              Tarih boyunca milletleri ayağa kaldıran en büyük güç, zorluklar karşısında geliştirilen teknik ve süreç inovasyonlarıdır. Belgeleri inceleyin, Tekno Muhabir ile mülakat yapın, 1919 ruhunda gazete ve sesli podcast yayınlayın.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-600">
              <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-stone-200">
                <FileText className="w-3.5 h-3.5 text-amber-800" />
                <span>1. Belgeler Yüklenir</span>
              </span>
              <span className="text-stone-400">→</span>
              <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-stone-200">
                <Mic className="w-3.5 h-3.5 text-amber-800" />
                <span>2. Tekno Muhabir Yanıtlar</span>
              </span>
              <span className="text-stone-400">→</span>
              <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-stone-200">
                <Newspaper className="w-3.5 h-3.5 text-amber-800" />
                <span>3. Gazete & Podcast Basılır</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Ana İçerik Konteyneri */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. BÖLÜM: BELGELER */}
        {activeTab === "belgeler" && (
          <DocumentsSection
            documents={documents}
            setDocuments={setDocuments}
            onProceedToReporter={() => setActiveTab("muhabir")}
            onProceedToPublish={() => setActiveTab("yayin")}
          />
        )}

        {/* 2. BÖLÜM: TEKNO MUHABİR */}
        {activeTab === "muhabir" && (
          <ReporterSection
            documents={documents}
            history={reporterHistory}
            setHistory={setReporterHistory}
            onProceedToPublish={() => setActiveTab("yayin")}
            activeSampleQuestions={currentSampleQuestions}
          />
        )}

        {/* 3. BÖLÜM: YAYIN (GAZETE & PODCAST) */}
        {activeTab === "yayin" && (
          <PublishSection
            documents={documents}
            newspaperData={newspaperData}
            setNewspaperData={setNewspaperData}
            podcastData={podcastData}
            setPodcastData={setPodcastData}
          />
        )}
      </main>

      {/* Alt Bilgi / Footer */}
      <footer className="border-t border-amber-900/10 bg-[#f5f0e6] py-6 px-4 sm:px-6 text-center text-xs text-stone-600 no-print font-serif">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-900" />
            <span className="font-bold text-stone-800">
              İnovasyonun İzinde: Fikirden Devrime
            </span>
            <span>• Teknoloji ve Tasarım Dersi</span>
          </div>

          <div className="text-[11px] text-stone-600">
            Gemini 3.8 Flash • Türkçe Öğretim Materyali • Kişisel Veri Toplanmaz
          </div>
        </div>
      </footer>
    </div>
  );
}
