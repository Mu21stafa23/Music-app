"use client";

import { useState } from "react";
import { X, Copy, Check, Moon, Sparkles } from "lucide-react";

export interface PlayingSong {
  videoId: string;
  title: string;
  artist?: string;
  thumbnail?: string;
}

interface MoonDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  playingSong: PlayingSong;
  currentTime: number;
  isDark?: boolean;
  dir?: "rtl" | "ltr";
}

const VIBE_PRESETS = ["MIDNIGHT 🌙", "STAY ✨", "US 🤍", "MISS YOU", "NO WORDS"];
const CLIP_LENGTH = 15;
const NUDGE = 5;

export default function MoonDropModal({
  isOpen,
  onClose,
  playingSong,
  currentTime,
  isDark = true,
  dir = "rtl",
}: MoonDropModalProps) {
  const [startOffset, setStartOffset] = useState(0);
  const [vibe, setVibe] = useState<string>(VIBE_PRESETS[0]);
  const [customVibe, setCustomVibe] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const startTime = Math.max(0, Math.floor(currentTime) + startOffset);
  const endTime = startTime + CLIP_LENGTH;
  const finalVibe = customVibe.trim() ? customVibe.trim().slice(0, 20) : vibe;

  const handleNudge = (delta: number) => {
    setStartOffset((prev) => Math.max(-10, Math.min(10, prev + delta)));
  };

  const buildLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      s: playingSong.videoId,
      t: String(startTime),
      vibe: finalVibe,
    });
    return `${origin}/?mode=echo&${params.toString()}`;
  };

  const handleGenerate = async () => {
    const link = buildLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(50);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border shadow-2xl transition-all ${
          isDark
            ? "bg-zinc-950/95 border-emerald-500/30 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-400">
            <Moon size={15} />
            <span>MOON DROP 15s</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cover + Moment Preview */}
        <div className={`flex gap-3.5 p-3 rounded-2xl border mb-5 ${isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
          {playingSong.thumbnail && (
            <img
              src={playingSong.thumbnail}
              alt={playingSong.title}
              className="w-14 h-14 rounded-xl object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs truncate">{playingSong.title}</p>
            {playingSong.artist && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {playingSong.artist}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {formatTime(startTime)} – {formatTime(endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Nudge controls */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <button
            onClick={() => handleNudge(-NUDGE)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
          >
            −5s
          </button>
          <span className="text-[11px] text-slate-400 w-24 text-center font-mono">
            تعديل اللحظة
          </span>
          <button
            onClick={() => handleNudge(NUDGE)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
          >
            +5s
          </button>
        </div>

        {/* Vibe Stamp */}
        <div className="mb-6 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 tracking-wide">
            VIBE STAMP
          </p>
          <div className="flex flex-wrap gap-1.5">
            {VIBE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setVibe(preset);
                  setCustomVibe("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  vibe === preset && !customVibe
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : isDark
                    ? "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            value={customVibe}
            onChange={(e) => setCustomVibe(e.target.value.slice(0, 20))}
            placeholder="أو اكتب بصمتك..."
            className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500/50"
                : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500"
            }`}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          {copied ? (
            <>
              <Check size={16} /> تم نسخ رابط الإهداء 🤍
            </>
          ) : (
            <>
              <Sparkles size={16} /> نسخ ومشاركة رابط الإهداء
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}