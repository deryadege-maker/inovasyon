"use client";

import React, { useState } from "react";
import { X, BookmarkPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { DocItem } from "./DocumentsSection";
import { NewspaperData, PodcastData } from "./PublishSection";

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocItem[];
  newspaperData: NewspaperData | null;
  podcastData: PodcastData | null;
  onSaved: () => void;
}

export default function SaveProjectModal({
  isOpen,
  onClose,
  documents,
  newspaperData,
  podcastData,
  onSaved,
}: SaveProjectModalProps) {
  const [title, setTitle] = useState(
    newspaperData?.manset
      ? newspaperData.manset.slice(0, 50)
      : documents[0]?.title || "İnovasyon Çalışması"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Lütfen bir başlık giriniz.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          documents,
          newspaperData,
          podcastData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Proje kaydedilemedi.");
      }

      setSuccess(true);
      onSaved();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-[#faf8f3] border-2 border-stone-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-stone-900 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center mx-auto mb-2 border border-amber-950">
            <BookmarkPlus className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-950">
            Projeyi Vercel Veritabanına Kaydet
          </h3>
          <p className="text-xs text-stone-600 font-serif mt-1">
            Yüklediğiniz belgeler, hazırladığınız gazete ve podcast hesabınıza kaydedilir.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center text-emerald-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 animate-bounce" />
            <p className="font-serif font-bold text-sm">
              Proje Vercel veritabanına başarıyla kaydedildi!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Proje Başlığı:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 1919 Telgraf Ağı İnovasyonu"
                className="w-full text-sm font-serif font-bold bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
              />
            </div>

            <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700 space-y-1 font-mono">
              <div>• {documents.length} Arşiv Belgesi</div>
              <div>• {newspaperData ? "Gazete Sayfası Hazır" : "Gazete Henüz Yok"}</div>
              <div>• {podcastData ? "Sesli Podcast Hazır" : "Podcast Henüz Yok"}</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:bg-stone-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Veritabanına Yazılıyor...</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Vercel Veritabanına Kaydet</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
