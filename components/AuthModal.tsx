"use client";

import React, { useState } from "react";
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  KeyRound, 
  Mail, 
  User as UserIcon,
  Sparkles
} from "lucide-react";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (!username.trim() || username.trim().length < 3) {
          throw new Error("Kullanıcı adı en az 3 karakter olmalıdır.");
        }
        if (!email.trim() || !email.includes("@")) {
          throw new Error("Lütfen geçerli bir e-posta adresi giriniz.");
        }
        if (password.length < 6) {
          throw new Error("Şifre en az 6 karakter olmalıdır.");
        }
        if (password !== passwordConfirm) {
          throw new Error("Şifreler birbiriyle eşleşmiyor.");
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Kayıt işlemi başarısız oldu.");
        }

        onSuccess(data.user);
        onClose();
      } else {
        if (!identifier.trim()) {
          throw new Error("Lütfen e-posta veya kullanıcı adı giriniz.");
        }
        if (!password) {
          throw new Error("Lütfen şifrenizi giriniz.");
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: identifier.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Giriş işlemi başarısız oldu.");
        }

        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    setMode("login");
    setIdentifier("ogretmen_demo");
    setPassword("inovasyon1919");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-[#faf8f3] border-2 border-stone-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-stone-900 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık & İkon */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center mx-auto mb-2 shadow-sm border border-amber-950">
            {mode === "login" ? (
              <LogIn className="w-6 h-6" />
            ) : (
              <UserPlus className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-950">
            {mode === "login" ? "Öğretmen Girişi" : "Yeni Hesap Oluştur"}
          </h3>
          <p className="text-xs text-stone-600 font-serif mt-1">
            Teknoloji ve Tasarım Dersi • Vercel Veritabanı
          </p>
        </div>

        {/* Kişisel Veri Güvenliği Uyarısı */}
        <div className="mb-5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-800" />
          <span>
            Yalnızca öğretmen hesabı içindir. Öğrenci adı veya numarası gibi kişisel veriler istenmez ve toplanmaz.
          </span>
        </div>

        {/* Mod Seçici Tab */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-stone-200/80 rounded-lg mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 rounded-md transition-all ${
              mode === "login"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`py-2 rounded-md transition-all ${
              mode === "register"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Kullanıcı Adı:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Örn: meltem_ogretmen"
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-posta Adresi:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ogretmen@okul.meb.k12.tr"
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Şifre (en az 6 karakter):
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Şifre Tekrar:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-posta veya Kullanıcı Adı:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="kullanici_adi veya e-posta"
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Şifre:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
              </div>
            </>
          )}

          {/* Gönder butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:bg-stone-300 disabled:text-stone-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Giriş Yap</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Kayıt Ol ve Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        {/* Hızlı test düğmesi */}
        {mode === "login" && (
          <div className="mt-4 pt-3 border-t border-stone-200 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-amber-900 hover:text-amber-950 font-medium inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Örnek Test Girişi Doldur (ogretmen_demo)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
