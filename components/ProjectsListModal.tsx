"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  FolderArchive, 
  Trash2, 
  DownloadCloud, 
  Loader2, 
  AlertCircle,
  FileText,
  Newspaper,
  Headphones,
  RefreshCw
} from "lucide-react";
import { DocItem } from "./DocumentsSection";
import { NewspaperData, PodcastData } from "./PublishSection";

export interface ProjectRecord {
  id: string;
  user_id: string;
  title: string;
  documents: DocItem[];
  newspaper_data: NewspaperData | null;
  podcast_data: PodcastData | null;
  created_at: string;
  updated_at: string;
}

interface ProjectsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (
    docs: DocItem[],
    news: NewspaperData | null,
    podcast: PodcastData | null
  ) => void;
}

export default function ProjectsListModal({
  isOpen,
  onClose,
  onLoadProject,
}: ProjectsListModalProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Projeler getirilemedi.");
      }
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err?.message || "Projeler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!isOpen) return;

    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setProjects(data.projects || []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err?.message || "Projeler yüklenirken hata oluştu.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu projeyi Vercel veritabanından silmek istediğinize emin misiniz?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Proje silinemedi.");
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err?.message || "Silme hatası.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelect = (proj: ProjectRecord) => {
    onLoadProject(proj.documents, proj.newspaper_data, proj.podcast_data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-[#faf8f3] border-2 border-stone-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-stone-900 relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-900 text-amber-100 flex items-center justify-center border border-amber-950">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-950">
                Kayıtlı Projelerim (Vercel Veritabanı)
              </h3>
              <p className="text-xs text-stone-600 font-serif">
                Daha önce hazırladığınız inovasyon belgeleri, gazete ve podcastler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchProjects}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-stone-200 transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-stone-200 transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Proje Listesi */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {loading && projects.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-800" />
              <span>Vercel veritabanından projeler yükleniyor...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center text-stone-500 font-serif text-sm">
              <FolderArchive className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <p>Henüz kaydedilmiş bir proje bulunmuyor.</p>
              <p className="text-xs text-stone-600 mt-1">
                Çalışmalarınızı tamamladıktan sonra &quot;Projeyi Kaydet&quot; düğmesiyle buraya kaydedebilirsiniz.
              </p>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelect(proj)}
                className="p-4 rounded-xl border border-stone-300 bg-white hover:border-amber-900/40 hover:bg-amber-50/30 transition-all cursor-pointer shadow-sm flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-stone-950 text-sm group-hover:text-amber-950 transition-colors">
                    {proj.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-stone-600 font-mono">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-800" />
                      {Array.isArray(proj.documents) ? proj.documents.length : 0} Belge
                    </span>
                    {proj.newspaper_data && (
                      <span className="flex items-center gap-1 text-emerald-800">
                        <Newspaper className="w-3.5 h-3.5" />
                        Gazete
                      </span>
                    )}
                    {proj.podcast_data && (
                      <span className="flex items-center gap-1 text-stone-800">
                        <Headphones className="w-3.5 h-3.5" />
                        Podcast
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-600 font-mono">
                    Güncellendi: {new Date(proj.updated_at).toLocaleDateString("tr-TR")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(proj);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Yükle</span>
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === proj.id}
                    onClick={(e) => handleDelete(proj.id, e)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-stone-100 transition-colors"
                    title="Sil"
                  >
                    {deletingId === proj.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-700" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
