"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  BookMarked,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { SAMPLE_DOCUMENT_SETS, SampleDocumentSet } from "@/lib/sample-documents";

export interface DocItem {
  id: string;
  label: string;
  title: string;
  content: string;
}

interface DocumentsSectionProps {
  documents: DocItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocItem[]>>;
  onProceedToReporter: () => void;
  onProceedToPublish?: () => void;
  onSelectSampleQuestion?: (q: string) => void;
}

export default function DocumentsSection({
  documents,
  setDocuments,
  onProceedToReporter,
}: DocumentsSectionProps) {
  const [selectedSetId, setSelectedSetId] = useState<string>("telgraf-1919");
  const [notification, setNotification] = useState<string | null>(null);

  const handleApplySampleSet = (set: SampleDocumentSet) => {
    setSelectedSetId(set.id);
    setDocuments(
      set.documents.map((d, index) => ({
        id: `belge-${index + 1}`,
        label: `Belge ${index + 1}`,
        title: d.title,
        content: d.content,
      }))
    );
    setNotification(`"${set.title}" belgeleri başarıyla yüklendi.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddDocument = () => {
    if (documents.length >= 4) return;
    const nextNum = documents.length + 1;
    setDocuments((prev) => [
      ...prev,
      {
        id: `belge-${nextNum}`,
        label: `Belge ${nextNum}`,
        title: `Tarihî İnovasyon Belgesi ${nextNum}`,
        content: "",
      },
    ]);
  };

  const handleRemoveDocument = (id: string) => {
    if (documents.length <= 2) {
      alert("En az 2 belge bulunmalıdır (Belge 1 ve Belge 2).");
      return;
    }
    const filtered = documents.filter((d) => d.id !== id);
    // Yeniden numaralandır
    const reindexed = filtered.map((d, idx) => ({
      ...d,
      label: `Belge ${idx + 1}`,
    }));
    setDocuments(reindexed);
  };

  const handleUpdateDoc = (id: string, field: "title" | "content", val: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, [field]: val } : doc))
    );
  };

  const handleClearAll = () => {
    if (confirm("Tüm belgeleri temizleyip boş şablon oluşturmak istiyor musunuz?")) {
      setSelectedSetId("custom");
      setDocuments([
        {
          id: "belge-1",
          label: "Belge 1",
          title: "Tarihî İnovasyon Belgesi 1",
          content: "",
        },
        {
          id: "belge-2",
          label: "Belge 2",
          title: "Tarihî İnovasyon Belgesi 2",
          content: "",
        },
      ]);
    }
  };

  const totalWords = documents.reduce(
    (acc, d) => acc + (d.content.trim() ? d.content.trim().split(/\s+/).length : 0),
    0
  );

  const isValid = documents.every((d) => d.content.trim().length > 15);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-[#fdfbf7] border border-amber-900/15 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <BookMarked className="w-4 h-4" />
              <span>1. BÖLÜM: TARİHÎ İNOVASYON BELGELERİ</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900 mt-1">
              Öğretmen Belge Arşivi & Metin Girişi
            </h2>
            <p className="text-sm text-stone-700 font-serif mt-1 max-w-3xl">
              Öğrencilerinizle derste inceleyeceğiniz 2 veya 3 tarihî belgeyi aşağıya yapıştırın. Tekno Muhabir ve gazete sayfası yalnızca buraya eklediğiniz belgelerdeki bilgileri kullanacaktır.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Temizle & Boş Başla</span>
            </button>
          </div>
        </div>

        {/* Ready Sample Packages Selector */}
        <div className="mt-5 pt-4 border-t border-amber-900/10">
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Hazır Örnek Belge Paketleri (Tek tıkla yükleyin):</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_DOCUMENT_SETS.map((set) => {
              const isSelected = selectedSetId === set.id;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => handleApplySampleSet(set)}
                  className={`text-left p-3 rounded-lg border transition-all text-xs ${
                    isSelected
                      ? "bg-amber-950/10 border-amber-900/40 shadow-sm ring-1 ring-amber-900/30"
                      : "bg-white/80 border-stone-200 hover:border-amber-900/30 hover:bg-amber-50/40"
                  }`}
                >
                  <div className="font-serif font-bold text-stone-900 text-sm flex items-center justify-between">
                    <span>{set.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-900 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-amber-900 font-medium mt-0.5">
                    {set.category}
                  </div>
                  <p className="text-stone-600 mt-1 line-clamp-2">
                    {set.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {notification && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Document Edit Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {documents.map((doc, idx) => {
          const charCount = doc.content.length;
          const wordCount = doc.content.trim() ? doc.content.trim().split(/\s+/).length : 0;

          return (
            <div
              key={doc.id}
              className="bg-[#fcfaf4] border-2 border-stone-300/80 rounded-xl p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
              style={{
                backgroundImage: "radial-gradient(#e5dfd3 0.75px, transparent 0.75px)",
                backgroundSize: "16px 16px",
              }}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-300">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-amber-900 text-amber-50 text-xs font-bold font-mono tracking-wide">
                      {doc.label}:
                    </span>
                    <span className="text-xs text-stone-600 font-mono">
                      (Arşiv Belgesi #{idx + 1})
                    </span>
                  </div>

                  {documents.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-stone-600 hover:text-red-700 p-1 rounded hover:bg-stone-200 transition-colors"
                      title="Bu belgeyi kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Title Input */}
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Belge Başlığı / Konusu:
                  </label>
                  <input
                    type="text"
                    value={doc.title}
                    onChange={(e) => handleUpdateDoc(doc.id, "title", e.target.value)}
                    placeholder="Örn: 1919 Telgraf Genelgesi veya İmalat Raporu"
                    className="w-full text-sm font-serif font-bold text-stone-900 bg-white/90 border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>

                {/* Content Textarea */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-600">
                      Belge Metni (&quot;{doc.label}:&quot; etiketli içerik):
                    </label>
                    <span className="text-[11px] text-stone-600 font-mono">
                      {wordCount} kelime | {charCount} karakter
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={doc.content}
                    onChange={(e) => handleUpdateDoc(doc.id, "content", e.target.value)}
                    placeholder={`Öğretmen buraya tarihî belge metnini yapıştırır.\nÖrnek:\nMustafa Kemal Paşa telgraf memurlarına gönderdiği talimatta "Haberleşme hatları hiçbir koşulda terk edilmeyecektir" bildirmiştir...`}
                    className="w-full text-sm font-serif text-stone-900 bg-white/90 border border-stone-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-800/40 leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span className="flex items-center gap-1 font-mono">
                  {doc.content.trim().length > 15 ? (
                    <span className="text-emerald-800 flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hazır
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-1 font-sans">
                      <AlertCircle className="w-3.5 h-3.5" /> Metin bekleniyor
                    </span>
                  )}
                </span>
                <span className="italic text-[11px] text-stone-600">
                  Tekno Muhabir doğrudan [{doc.label}] olarak atıf yapacaktır.
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Document button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-100/80 border border-stone-300 rounded-xl p-4">
        <div className="flex items-center gap-3">
          {documents.length < 3 && (
            <button
              type="button"
              onClick={handleAddDocument}
              className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-sm font-medium text-stone-800 flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 text-amber-800" />
              <span>3. Belgeyi Ekle (&quot;Belge 3:&quot;)</span>
            </button>
          )}
          <span className="text-xs text-stone-600 font-mono">
            Toplam Arşiv: {documents.length} Belge, {totalWords} Kelime
          </span>
        </div>

        {/* Action Next Step Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={!isValid}
            onClick={onProceedToReporter}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              isValid
                ? "bg-amber-900 text-amber-50 hover:bg-amber-950 shadow-md"
                : "bg-stone-300 text-stone-600 cursor-not-allowed"
            }`}
          >
            <span>2. Tekno Muhabir&apos;e Geç</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
