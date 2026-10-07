"use client";

import React from "react";
import { 
  FileText, 
  Mic, 
  Newspaper, 
  Sparkles, 
  BookOpen, 
  Compass,
  LogIn,
  LogOut,
  FolderArchive,
  BookmarkPlus,
  User as UserIcon,
  Database
} from "lucide-react";
import { AuthUser } from "./AuthModal";

interface HeaderProps {
  activeTab: "belgeler" | "muhabir" | "yayin";
  setActiveTab: (tab: "belgeler" | "muhabir" | "yayin") => void;
  documentCount: number;
  hasNewspaper: boolean;
  hasPodcast: boolean;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onOpenSaveProject: () => void;
  onOpenProjectsList: () => void;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  documentCount,
  hasNewspaper,
  hasPodcast,
  user,
  onOpenAuth,
  onOpenSaveProject,
  onOpenProjectsList,
  onLogout,
}: HeaderProps) {
  return (
    <header className="border-b border-amber-900/15 bg-[#f5f0e6]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-900 text-amber-100 flex items-center justify-center shadow-md border border-amber-800/40 shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-900/10 text-amber-900 border border-amber-900/20">
                  Teknoloji ve Tasarım Dersi
                </span>
                <span className="text-xs text-stone-600 flex items-center gap-1 font-serif">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Tarihî İnovasyon Atölyesi
                </span>
                <span className="text-[11px] text-stone-600 flex items-center gap-1 font-mono bg-stone-200/60 px-1.5 py-0.5 rounded">
                  <Database className="w-3 h-3 text-stone-600" /> Vercel DB
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight mt-0.5">
                İnovasyonun İzinde: Fikirden Devrime
              </h1>
              <p className="text-xs sm:text-sm text-stone-700 font-serif mt-0.5">
                1919 ruhundan ilham alan belgelerle teknolojik devrimleri inceleyin, Tekno Muhabir ile röportaj yapın, gazete ve podcast yayınlayın.
              </p>
            </div>
          </div>

          {/* Quick Info & Auth Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto text-xs font-mono">
            <div className="px-2.5 py-1 rounded-md bg-stone-100/90 border border-stone-300 text-stone-700 flex items-center gap-1.5 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>{documentCount} Belge Aktif</span>
            </div>

            {(hasNewspaper || hasPodcast) && (
              <div className="px-2.5 py-1 rounded-md bg-emerald-100/90 border border-emerald-300 text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Yayın Hazır</span>
              </div>
            )}

            {/* Auth Durumu */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg p-1 shadow-sm">
                <span className="px-2 py-1 rounded bg-amber-900/10 text-amber-950 font-bold flex items-center gap-1 font-sans text-xs">
                  <UserIcon className="w-3 h-3 text-amber-900" />
                  <span>{user.username}</span>
                </span>

                <button
                  type="button"
                  onClick={onOpenProjectsList}
                  className="px-2 py-1 rounded hover:bg-stone-100 text-stone-700 flex items-center gap-1 font-sans text-xs font-medium transition-colors"
                  title="Kayıtlı Projelerim"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-800" />
                  <span className="hidden sm:inline">Projelerim</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSaveProject}
                  className="px-2 py-1 rounded bg-amber-900 text-amber-50 hover:bg-amber-950 flex items-center gap-1 font-sans text-xs font-medium transition-colors"
                  title="Mevcut Çalışmayı Kaydet"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kaydet</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1 rounded text-stone-400 hover:text-red-700 hover:bg-stone-100 transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 font-sans text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Öğretmen Girişi / Kayıt</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Main Sections Tabs */}
        <div className="mt-4 flex items-center gap-2 border-t border-amber-900/10 pt-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("belgeler")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 shrink-0 ${
              activeTab === "belgeler"
                ? "bg-amber-900 text-amber-50 shadow-sm"
                : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-950/20 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <FileText className="w-4 h-4" />
            <span>Belgeler</span>
            <span className="text-xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
              {documentCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("muhabir")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 shrink-0 ${
              activeTab === "muhabir"
                ? "bg-amber-900 text-amber-50 shadow-sm"
                : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-950/20 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <Mic className="w-4 h-4" />
            <span>Tekno Muhabir</span>
            <span className="text-xs px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 font-mono">
              Soru & Cevap
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("yayin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 shrink-0 ${
              activeTab === "yayin"
                ? "bg-amber-900 text-amber-50 shadow-sm"
                : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-950/20 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <Newspaper className="w-4 h-4" />
            <span>Yayın (Gazete & Podcast)</span>
            {(hasNewspaper || hasPodcast) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
