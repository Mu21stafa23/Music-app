"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import YouTube from "react-youtube";
import { fetchLyrics, LyricLine } from "@/lib/lyrics";
import MoonDropModal from "@/components/MoonDropModal";
import {
  Search,
  Music,
  Mic2,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ListMusic,
  Sparkles,
  X,
  Disc,
  Eye,
  Calendar,
  Clock,
  User,
  Info,
  Moon,
  Sun,
  Languages,
  Radio,
  Heart,
  Copy,
  Check,
  Share2,
  Download,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  FolderPlus,
  ListPlus,
  Smartphone,
  Timer,
  Volume2,
  VolumeX,
  Bookmark,
  Activity,
  Sliders,
  CloudRain,
  Waves,
  Flame,
  FileText,
  BarChart2,
} from "lucide-react";

interface SongData {
  videoId: string;
  title: string;
  thumbnail: string;
  artist: string;
  duration: string;
  views?: number;
  ago?: string;
}

interface Playlist {
  id: string;
  name: string;
  songs: SongData[];
}

interface SongBookmark {
  id: string;
  songId: string;
  time: number;
  label: string;
}

export default function Home() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // البحث والنتائج والقوائم
  const [track, setTrack] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<SongData[]>([]);
  const [activeTab, setActiveTab] = useState<"results" | "favorites" | "playlists" | "stats">("results");
  const [favorites, setFavorites] = useState<SongData[]>([]);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [playlistModalSong, setPlaylistModalSong] = useState<SongData | null>(null);

  const [previewSong, setPreviewSong] = useState<SongData | null>(null);
  const [playingSong, setPlayingSong] = useState<SongData | null>(null);

  // الكلمات والتزامن
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [syncOffset, setSyncOffset] = useState<number>(0);
  const [translations, setTranslations] = useState<{ [time: number]: string }>({});
  const [showTranslation, setShowTranslation] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [showFullLyricsReader, setShowFullLyricsReader] = useState(false);

  // المشغل
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // المؤثرات والبصريات
  const [ambientColor, setAmbientColor] = useState<string>("rgba(16, 185, 129, 0.2)");
  const [isKaraoke, setIsKaraoke] = useState(false);
  const [isVinylMode, setIsVinylMode] = useState(false);
  const [karaokeFontSize, setKaraokeFontSize] = useState(24);

  // مؤقت النوم وأصوات البيئة (Sleep Timer & Ambient Noise)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  const [ambientSound, setAmbientSound] = useState<"none" | "rain" | "waves" | "fire">("none");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<AudioNode | null>(null);

  // الدبابيس والإحصائيات
  const [bookmarks, setBookmarks] = useState<SongBookmark[]>([]);
  const [listenedSeconds, setListenedSeconds] = useState<number>(0);

  // بطاقات الاقتباسات و PWA
  const [quoteLine, setQuoteLine] = useState<LyricLine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const activeRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // MOON Echo (زر LOVE / مشاركة 15 ثانية)
  const [showMoonDrop, setShowMoonDrop] = useState(false);
  const [echoVibe, setEchoVibe] = useState<string | null>(null); // الـ Vibe Stamp القادمة من رابط صديق
  const [echoStartTime, setEchoStartTime] = useState<number | null>(null); // الثانية اللي لازم نبدأ منها
  const [isLoadingEcho, setIsLoadingEcho] = useState(false);
  const echoAppliedRef = useRef(false); // يمنع تكرار الـ seek أكتر من مرة

  const t = useMemo(() => {
    return {
      ar: {
        platformName: "MOON Sound",
        tagline: "منصتك الذكية الشاملة للموسيقى والكلمات المزامنة",
        searchPlaceholder: "ابحث عن اسم الأغنية أو الفنان...",
        searchBtn: "بحث",
        resultsTitle: "النتائج",
        favoritesTitle: "المفضلة",
        playlistsTitle: "قوائمي",
        statsTitle: "الإحصائيات",
        noResults: "ابحث عن أي اسم أغنية أو مغني لعرض القائمة",
        noFavorites: "لا توجد أغاني في المفضلة بعد.",
        noPlaylists: "لا توجد قوائم تشغيل. اضغط على أزرار (+) لإنشاء قائمة!",
        artistLabel: "المغني / القناة",
        viewsLabel: "المشاهدات",
        dateLabel: "تاريخ النشر",
        durationLabel: "مدة الأغنية",
        playBtn: "تشغيل الأغنية ومزامنة الكلمات",
        selectPrompt: "اختر أي أغنية لمعاينة تفاصيلها وتجربة الميزات",
        syncingLyrics: "جاري المزامنة وجلب الكلمات...",
        noLyrics: "لا توجد كلمات متزامنة متوفرة لهذه الأغنية",
        na: "غير متوفر",
        sec: "ثوانٍ",
        liveRadio: "مباشر",
        translateBtn: "ترجمة الكلمات",
        karaokeMode: "وضع الكاريوكي",
        createCard: "بطاقة اقتباس",
        installApp: "تثبيت التطبيق",
        addToPlaylistTitle: "إضافة الأغنية إلى قائمة تشغيل",
        createNewPlaylistHeader: "أو إنشاء قائمة جديدة:",
        newPlaylistPlaceholder: "اكتب اسم القائمة الجديدة...",
        addBtn: "إضافة",
        createAndAddBtn: "إنشاء وإضافة",
        selectPlaylistPrompt: "اختر قائمة تشغيل لعرض أغانيك المفضلة فيها",
        sleepTimer: "مؤقت النوم",
        ambientNoise: "أصوات البيئة",
        vinylMode: "قرص الفينيل",
        addBookmark: "حفظ الدبوس",
        fullLyrics: "الكلمات كاملة",
      },
      en: {
        platformName: "MOON Sound",
        tagline: "Your Ultimate Smart Music & Synced Lyrics Platform",
        searchPlaceholder: "Search for a song or artist...",
        searchBtn: "Search",
        resultsTitle: "Results",
        favoritesTitle: "Favorites",
        playlistsTitle: "My Playlists",
        statsTitle: "Stats",
        noResults: "Search for any song or artist to view results",
        noFavorites: "No favorites saved yet.",
        noPlaylists: "No playlists created yet. Click (+) to create one!",
        artistLabel: "Artist / Channel",
        viewsLabel: "Views",
        dateLabel: "Release Date",
        durationLabel: "Duration",
        playBtn: "Play Song & Sync Lyrics",
        selectPrompt: "Select a song to preview details and explore features",
        syncingLyrics: "Syncing & fetching lyrics...",
        noLyrics: "No synced lyrics available for this song",
        na: "N/A",
        sec: "sec",
        liveRadio: "LIVE",
        translateBtn: "Translate Lyrics",
        karaokeMode: "Karaoke Mode",
        createCard: "Quote Card",
        installApp: "Install App",
        addToPlaylistTitle: "Add Song to Playlist",
        createNewPlaylistHeader: "Or Create New Playlist:",
        newPlaylistPlaceholder: "Enter playlist name...",
        addBtn: "Add",
        createAndAddBtn: "Create & Add",
        selectPlaylistPrompt: "Select a playlist to view its songs",
        sleepTimer: "Sleep Timer",
        ambientNoise: "Ambient Sounds",
        vinylMode: "Vinyl Mode",
        addBookmark: "Add Bookmark",
        fullLyrics: "Full Lyrics",
      },
    }[lang];
  }, [lang]);

  // حساب السطر النشط مع تعديل التزامن Sync Offset
  const activeIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    const adjustedTime = currentTime + syncOffset;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (adjustedTime >= lyrics[i].time) {
        return i;
      }
    }
    return 0;
  }, [currentTime, lyrics, syncOffset]);

  // التمرير التلقائي السلس
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  // احتساب دقائق الاستماع المباشرة
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setListenedSeconds((prev) => {
          const next = prev + 1;
          localStorage.setItem("moon_listened_sec", next.toString());
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // مؤقت النوم Sleep Timer
  useEffect(() => {
    let interval: any;
    if (sleepTimeRemaining !== null && sleepTimeRemaining > 0) {
      interval = setInterval(() => {
        setSleepTimeRemaining((prev) => {
          if (prev && prev > 1) return prev - 1;
          if (player) {
            player.pauseVideo();
            setIsPlaying(false);
          }
          setSleepTimerMinutes(null);
          return null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimeRemaining, player]);

  const startSleepTimer = (mins: number) => {
    setSleepTimerMinutes(mins);
    setSleepTimeRemaining(mins * 60);
  };

  const cancelSleepTimer = () => {
    setSleepTimerMinutes(null);
    setSleepTimeRemaining(null);
  };

  // مولد أصوات الطبيعة عبر Web Audio API
  const toggleAmbientSound = (type: "rain" | "waves" | "fire") => {
    if (ambientSound === type) {
      if (ambientNodeRef.current) ambientNodeRef.current.disconnect();
      setAmbientSound("none");
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    if (ambientNodeRef.current) ambientNodeRef.current.disconnect();

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const filter = ctx.createBiquadFilter();
    if (type === "rain") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
    } else if (type === "waves") {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
    } else {
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseNode.start();
    ambientNodeRef.current = noiseNode;
    setAmbientSound(type);
  };

  // PWA Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  // لون التوهج الخلفي
  useEffect(() => {
    const activeSong = playingSong || previewSong;
    if (!activeSong?.videoId) return;

    let hash = 0;
    for (let i = 0; i < activeSong.videoId.length; i++) {
      hash = activeSong.videoId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    setAmbientColor(`hsla(${h}, 70%, 45%, 0.3)`);
  }, [playingSong, previewSong]);

  // تحميل واسترجاع البيانات المحفوظة
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem("moon_favorites");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedPlaylists = localStorage.getItem("moon_playlists");
      if (savedPlaylists) {
        const parsed = JSON.parse(savedPlaylists);
        setPlaylists(parsed);
        if (parsed.length > 0) setSelectedPlaylistId(parsed[0].id);
      }

      const savedBookmarks = localStorage.getItem("moon_bookmarks");
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

      const savedSec = localStorage.getItem("moon_listened_sec");
      if (savedSec) setListenedSeconds(parseInt(savedSec, 10));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleFavorite = useCallback((song: SongData) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.videoId === song.videoId);
      const updated = exists ? prev.filter((f) => f.videoId !== song.videoId) : [song, ...prev];
      localStorage.setItem("moon_favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addBookmark = () => {
    if (!playingSong) return;
    const newBm: SongBookmark = {
      id: Date.now().toString(),
      songId: playingSong.videoId,
      time: currentTime,
      label: formatTime(currentTime),
    };
    const updated = [newBm, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem("moon_bookmarks", JSON.stringify(updated));
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem("moon_bookmarks", JSON.stringify(updated));
  };

  const addSongToPlaylist = (playlistId: string, song: SongData) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId && !pl.songs.some((s) => s.videoId === song.videoId)) {
        return { ...pl, songs: [...pl.songs, song] };
      }
      return pl;
    });
    setPlaylists(updated);
    localStorage.setItem("moon_playlists", JSON.stringify(updated));
    setPlaylistModalSong(null);
  };

  const createPlaylistAndAddSong = (song: SongData) => {
    if (!newPlaylistName.trim()) return;
    const newPl: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      songs: [song],
    };
    const updated = [...playlists, newPl];
    setPlaylists(updated);
    localStorage.setItem("moon_playlists", JSON.stringify(updated));
    setSelectedPlaylistId(newPl.id);
    setNewPlaylistName("");
    setPlaylistModalSong(null);
  };

  const deletePlaylist = (playlistId: string) => {
    const updated = playlists.filter((pl) => pl.id !== playlistId);
    setPlaylists(updated);
    localStorage.setItem("moon_playlists", JSON.stringify(updated));
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const removeSongFromPlaylist = (playlistId: string, videoId: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return { ...pl, songs: pl.songs.filter((s) => s.videoId !== videoId) };
      }
      return pl;
    });
    setPlaylists(updated);
    localStorage.setItem("moon_playlists", JSON.stringify(updated));
  };

  // ترجمة سريعة دفعة واحدة
  const handleTranslateLyrics = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (Object.keys(translations).length > 0) {
      setShowTranslation(true);
      return;
    }

    setLoadingTranslation(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lyrics, targetLang: lang }),
      });
      const data = await res.json();
      setTranslations(data.translations || {});
      setShowTranslation(true);
    } catch {
      console.error("Failed to translate lyrics");
    } finally {
      setLoadingTranslation(false);
    }
  };

  // صانع بطاقات الاقتباسات
  const drawQuoteCard = (line: LyricLine) => {
    setQuoteLine(line);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const activeSong = playingSong || previewSong;
      canvas.width = 1080;
      canvas.height = 1080;

      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, "#09090b");
      grad.addColorStop(0.5, "#18181b");
      grad.addColorStop(1, "#022c22");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      const x = 100, y = 100, w = 880, h = 880, r = 40;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("“", 540, 320);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px sans-serif";
      const words = line.text.split(" ");
      let lineStr = "";
      let startY = 420;

      for (let n = 0; n < words.length; n++) {
        const testLine = lineStr + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 750 && n > 0) {
          ctx.fillText(lineStr, 540, startY);
          lineStr = words[n] + " ";
          startY += 60;
        } else {
          lineStr = testLine;
        }
      }
      ctx.fillText(lineStr, 540, startY);

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 56px sans-serif";
      ctx.fillText("”", 540, startY + 80);

      if (activeSong) {
        ctx.fillStyle = "#a1a1aa";
        ctx.font = "28px sans-serif";
        ctx.fillText(`${activeSong.title} — ${activeSong.artist}`, 540, 780);
      }

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("MOON Sound 🌙", 540, 880);
    }, 100);
  };

  const downloadQuoteCardPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `moon_sound_quote_${Date.now()}.png`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // التحكم بسرعة التشغيل
  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(speed);
    }
  };

  // اختصارات المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleSkip(lang === "ar" ? -5 : 5);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleSkip(lang === "ar" ? 5 : -5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, isPlaying, lang]);

  // البحث
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (track.trim().length >= 2) {
        try {
          const res = await fetch(`/api/suggestions?q=${encodeURIComponent(track)}`);
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [track]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && player.getCurrentTime && isPlaying) {
        setCurrentTime(player.getCurrentTime());
        if (player.getDuration) setDuration(player.getDuration());
      }
    }, 250);
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const executeSearch = async (queryText: string) => {
    if (!queryText.trim()) return;

    setShowSuggestions(false);
    setLoading(true);
    setSearchResults([]);
    setPreviewSong(null);
    setActiveTab("results");

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryText)}`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        setPreviewSong(data.results[0]);
      }
    } catch (err) {
      console.error("خطأ في البحث:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(track);
  };

  // جلب بيانات أغنية من الـ videoId فقط (مستخدمة لما حد يفتح رابط MOON Echo)
  const loadSongFromVideoId = async (videoId: string): Promise<SongData | null> => {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          `https://www.youtube.com/watch?v=${videoId}`
        )}&format=json`
      );
      if (!res.ok) return null;
      const data = await res.json();
      return {
        videoId,
        title: data.title || "MOON Echo",
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        artist: data.author_name || "",
        duration: "",
      };
    } catch (err) {
      console.error("تعذر جلب بيانات الأغنية من الرابط:", err);
      return null;
    }
  };

  // قراءة رابط MOON Echo (?s=videoId&t=seconds&vibe=text) عند فتح الصفحة لأول مرة
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    const tParam = params.get("t");
    const vibe = params.get("vibe");

    if (!s) return;

    const startAt = tParam ? Math.max(0, parseInt(tParam, 10) || 0) : 0;

    setIsLoadingEcho(true);
    loadSongFromVideoId(s).then(async (song) => {
      setIsLoadingEcho(false);
      if (!song) return;

      setEchoStartTime(startAt);
      setEchoVibe(vibe || null);
      echoAppliedRef.current = false;

      setPreviewSong(song);
      setPlayingSong(song);
      setLoadingLyrics(true);
      setLyrics([]);
      setSyncOffset(0);
      setTranslations({});
      setShowTranslation(false);

      try {
        const parsedLyrics = await fetchLyrics(song.title, song.artist);
        setLyrics(parsedLyrics || []);
      } catch (err) {
        console.error("خطأ في الكلمات:", err);
      } finally {
        setLoadingLyrics(false);
      }

      // تنظيف الرابط من الـ query params بعد ما ناخد اللي محتاجينه منه
      window.history.replaceState({}, "", window.location.pathname);

      // إخفاء الـ Vibe Stamp تلقائياً بعد كام ثانية
      if (vibe) {
        setTimeout(() => setEchoVibe(null), 6000);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartPlaying = async (song: SongData) => {
    setPlayingSong(song);
    setLoadingLyrics(true);
    setLyrics([]);
    setSyncOffset(0);
    setTranslations({});
    setShowTranslation(false);
    setCurrentTime(0);

    try {
      const parsedLyrics = await fetchLyrics(song.title, song.artist);
      setLyrics(parsedLyrics || []);
    } catch (err) {
      console.error("خطأ في الكلمات:", err);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const handleSeek = (newTime: number) => {
    if (player) {
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (player) {
      const targetTime = Math.max(0, Math.min(duration || Infinity, currentTime + seconds));
      handleSeek(targetTime);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      player.playVideo();
      setIsPlaying(true);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-black text-zinc-100" : "bg-slate-100 text-slate-900";
  const navClass = isDark ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white/90 border-slate-200 shadow-sm";
  const cardBg = isDark ? "bg-zinc-900/40 border-zinc-800/60" : "bg-white border-slate-200/80 shadow-xl";
  const innerCard = isDark ? "bg-zinc-950/80 border-zinc-800/80" : "bg-slate-50 border-slate-200/90";

  const currentPlaylist = playlists.find((pl) => pl.id === selectedPlaylistId);
  const listToDisplay =
    activeTab === "results"
      ? searchResults
      : activeTab === "favorites"
      ? favorites
      : currentPlaylist
      ? currentPlaylist.songs
      : [];

  const currentSongBookmarks = bookmarks.filter((b) => b.songId === playingSong?.videoId);

  return (
    <main
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen ${bgClass} p-3 sm:p-6 md:p-8 font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden transition-colors duration-300`}
    >
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 opacity-60"
        style={{ backgroundColor: ambientColor }}
      />

      {/* Navbar */}
      <nav className={`relative z-40 flex flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border ${navClass} backdrop-blur-xl mb-6 shadow-xl`}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl sm:rounded-2xl text-black shadow-lg shadow-emerald-500/20">
            <Moon className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                {t.platformName}
              </h1>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" />
                {t.liveRadio}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden xs:block">{t.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {deferredPrompt && (
            <button
              onClick={handleInstallPWA}
              className="px-3 py-2 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">{t.installApp}</span>
            </button>
          )}

          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold ${
              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === "ar" ? "EN" : "عربي"}</span>
          </button>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-center ${
              isDark ? "bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800" : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200"
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </nav>

      {/* شريط البحث */}
      <header className="relative z-30 mb-6 sm:mb-8">
        <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-full border shadow-2xl backdrop-blur-xl transition-all ${
              isDark ? "bg-zinc-900/90 text-white border-zinc-800" : "bg-white text-slate-900 border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex items-center flex-1 px-3 gap-2 min-w-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                dir="auto"
                placeholder={t.searchPlaceholder}
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full bg-transparent focus:outline-none text-xs sm:text-sm"
              />
              {track && (
                <button
                  type="button"
                  onClick={() => {
                    setTrack("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 font-bold text-zinc-950 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all text-xs sm:text-sm disabled:opacity-50 shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 flex-shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.searchBtn}</span>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </>
              )}
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto divide-y backdrop-blur-2xl ${
                isDark ? "bg-zinc-900/95 border-zinc-800 divide-zinc-800/40 text-white" : "bg-white/95 border-slate-200 divide-slate-100 text-slate-800"
              }`}
            >
              {suggestions.map((sugg, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setTrack(sugg);
                    setShowSuggestions(false);
                    executeSearch(sugg);
                  }}
                  className="px-4 py-2.5 hover:bg-emerald-500/10 cursor-pointer text-xs sm:text-sm hover:text-emerald-500 transition-colors flex items-center gap-3"
                  dir="auto"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{sugg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* مشغل يوتيوب الخفي */}
      {playingSong?.videoId && (
        <div className="hidden">
          <YouTube
            videoId={playingSong.videoId}
            opts={{ playerVars: { autoplay: 1 } }}
            onReady={(e) => {
              setPlayer(e.target);
              setIsPlaying(true);
              if (e.target.getDuration) setDuration(e.target.getDuration());

              if (echoStartTime !== null && !echoAppliedRef.current) {
                echoAppliedRef.current = true;
                e.target.seekTo(echoStartTime, true);
                setCurrentTime(echoStartTime);
              }
            }}
            onStateChange={(e) => setIsPlaying(e.data === 1)}
          />
        </div>
      )}

      {/* التخطيط الرئيسي */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* القائمة الجانبية */}
        <section className={`lg:col-span-1 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border h-auto max-h-[480px] lg:max-h-none lg:h-[640px] flex flex-col backdrop-blur-xl shadow-2xl ${cardBg}`}>
          
          <div className="flex flex-col gap-3 mb-3 pb-2.5 border-b border-slate-200/60 dark:border-zinc-800/40">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab("results")}
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === "results" ? "bg-emerald-500 text-zinc-950 shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>{t.resultsTitle} ({searchResults.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("favorites")}
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === "favorites" ? "bg-rose-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{t.favoritesTitle} ({favorites.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("playlists")}
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === "playlists" ? "bg-teal-500 text-zinc-950 shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{t.playlistsTitle} ({playlists.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("stats")}
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === "stats" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{t.statsTitle}</span>
              </button>
            </div>

            {activeTab === "playlists" && playlists.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border flex items-center gap-2 flex-shrink-0 transition-all ${
                      selectedPlaylistId === pl.id
                        ? "bg-teal-500/20 border-teal-500 text-teal-400 shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    <span>{pl.name} ({pl.songs.length})</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(pl.id);
                      }}
                      className="text-red-400 hover:text-red-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-800">
            {activeTab === "stats" ? (
              /* تبويب الإحصائيات (MOON Wrapped) */
              <div className="space-y-4 p-2 text-center">
                <div className={`p-4 rounded-2xl border ${innerCard} space-y-2`}>
                  <Activity className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="font-black text-sm">مجموع دقائق الاستماع</h4>
                  <p className="text-2xl font-black text-emerald-400">
                    {Math.floor(listenedSeconds / 60)} دقيقة
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCard} space-y-2`}>
                  <Heart className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="font-black text-sm">الأغاني المفضلة</h4>
                  <p className="text-2xl font-black text-rose-400">{favorites.length} أغنية</p>
                </div>
              </div>
            ) : listToDisplay.length > 0 ? (
              listToDisplay.map((song) => {
                const isPreviewing = previewSong?.videoId === song.videoId;
                const isNowPlaying = playingSong?.videoId === song.videoId && isPlaying;
                const isFav = favorites.some((f) => f.videoId === song.videoId);

                return (
                  <div
                    key={song.videoId}
                    onClick={() => setPreviewSong(song)}
                    className={`group flex items-center gap-3 p-2.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all border ${
                      isPreviewing
                        ? isDark
                          ? "bg-emerald-950/30 border-emerald-500/50 shadow-lg text-white"
                          : "bg-emerald-50 border-emerald-500/60 shadow-md text-slate-900"
                        : isDark
                          ? "bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-800/40 text-zinc-300"
                          : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 text-slate-800"
                    }`}
                  >
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                      {isNowPlaying && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                          <Disc className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-xs sm:text-sm truncate ${isPreviewing ? (isDark ? "text-emerald-400" : "text-emerald-600") : ""}`}>
                        {song.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-zinc-500 truncate mt-0.5">{song.artist}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistModalSong(song);
                      }}
                      className="p-1.5 hover:scale-110 text-teal-500"
                      title="إضافة لقائمة"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    {activeTab === "playlists" && selectedPlaylistId ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSongFromPlaylist(selectedPlaylistId, song.videoId);
                        }}
                        className="p-1.5 hover:scale-110 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song);
                        }}
                        className="p-1.5 hover:scale-110 text-rose-500"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
                      </button>
                    )}

                    <span className={`text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                      isDark ? "bg-zinc-900/60 border-zinc-800 text-zinc-400" : "bg-slate-200/60 border-slate-300/60 text-slate-600"
                    }`}>
                      {song.duration}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-400 dark:text-zinc-500 py-16 flex flex-col items-center gap-2.5 px-4">
                <Music className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-zinc-600" />
                <p className="text-xs sm:text-sm">
                  {activeTab === "results"
                    ? t.noResults
                    : activeTab === "favorites"
                    ? t.noFavorites
                    : playlists.length === 0
                    ? t.noPlaylists
                    : t.selectPlaylistPrompt}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* شاشة المشغل والكلمات المزامنة */}
        <section className={`lg:col-span-2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border h-auto min-h-[480px] lg:h-[640px] flex flex-col backdrop-blur-xl shadow-2xl relative overflow-hidden ${cardBg}`}>

          {/* بانر MOON Echo — بيظهر للمستلم لحظة فتح رابط صديقه، وبيختفي لوحده */}
          {echoVibe && (
            <div
              className="absolute inset-x-0 top-0 z-30 flex flex-col items-center justify-center gap-2 py-8 sm:py-10 pointer-events-none animate-fadeIn"
              style={{
                background: `linear-gradient(to bottom, ${ambientColor}, transparent)`,
              }}
            >
              <span className="text-[10px] sm:text-xs tracking-[0.3em] text-indigo-300/80 font-bold flex items-center gap-1.5">
                <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                MOON ECHO
              </span>
              <span className="text-2xl sm:text-4xl font-black tracking-widest text-white drop-shadow-[0_0_25px_rgba(129,140,248,0.6)]">
                {echoVibe}
              </span>
            </div>
          )}

          {isLoadingEcho && (
            <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-indigo-200 tracking-wide">جاري فتح اللحظة...</p>
            </div>
          )}

          {playingSong && playingSong.videoId === previewSong?.videoId ? (
            <>
              {/* شريط التحكم والتخصيص */}
              <div className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border shadow-2xl mb-4 flex flex-col gap-3 backdrop-blur-xl ${innerCard}`}>
                
                {/* الجزء العلوي لزر التشغيل والأدوات الذكية */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    
                    {/* تحويل الغلاف لقرص فينيل دوار عالي الدقة */}
                    <div className={`relative ${isVinylMode ? "animate-spin [animation-duration:8s]" : ""}`}>
                      <img
                        src={playingSong.thumbnail}
                        alt={playingSong.title}
                        className={`w-12 h-12 sm:w-14 sm:h-14 object-cover shadow-lg border border-slate-200 dark:border-zinc-800 flex-shrink-0 ${
                          isVinylMode ? "rounded-full border-4 border-zinc-900" : "rounded-lg sm:rounded-xl"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs sm:text-base truncate">{playingSong.title}</h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{playingSong.artist}</p>
                    </div>
                  </div>

                  {/* أزرار التحكم بالتشغيل */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleSkip(-5)}
                      className={`p-2 rounded-lg border flex items-center gap-1 text-xs font-bold ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>5{t.sec}</span>
                    </button>

                    <button
                      onClick={togglePlay}
                      className="p-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => handleSkip(5)}
                      className={`p-2 rounded-lg border flex items-center gap-1 text-xs font-bold ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      <span>5{t.sec}</span>
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* أزرار الميزات الـ 11 التفاعلية */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    
                    {/* تعديل التزامن (+0.5s / -0.5s) */}
                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-zinc-800 px-1 py-0.5 bg-slate-100 dark:bg-zinc-900 text-[10px] font-bold">
                      <button onClick={() => setSyncOffset((o) => o - 0.5)} className="px-1 text-slate-400 hover:text-emerald-500">-0.5s</button>
                      <span className="text-emerald-500 px-1">{syncOffset > 0 ? `+${syncOffset}` : syncOffset}s</span>
                      <button onClick={() => setSyncOffset((o) => o + 0.5)} className="px-1 text-slate-400 hover:text-emerald-500">+0.5s</button>
                    </div>

                    {/* زر الفينيل Vinyl Mode */}
                    <button
                      onClick={() => setIsVinylMode(!isVinylMode)}
                      className={`p-2 rounded-xl border text-xs ${isVinylMode ? "bg-amber-500 text-black border-amber-400" : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400"}`}
                      title={t.vinylMode}
                    >
                      <Disc className="w-4 h-4" />
                    </button>

                    {/* زر الدبوس Bookmark */}
                    <button
                      onClick={addBookmark}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-amber-500 hover:scale-105"
                      title={t.addBookmark}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {/* ترجمة الكلمات */}
                    <button
                      onClick={handleTranslateLyrics}
                      disabled={loadingTranslation || lyrics.length === 0}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                        showTranslation
                          ? "bg-emerald-500 text-zinc-950 border-emerald-400"
                          : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {loadingTranslation ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Languages className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </button>

                    {/* MOON Drop / إرسال Echo لحظة 15 ثانية */}
                    <button
                      onClick={() => setShowMoonDrop(true)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-indigo-400 hover:scale-105 transition-transform"
                      title="MOON Drop"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* الكاريوكي الشاشة الكاملة */}
                    <button
                      onClick={() => setIsKaraoke(true)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-emerald-500"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* شريط السرعات والأصوات البيئية ومؤقت النوم */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 dark:border-zinc-800 pt-2 text-[11px]">
                  
                  {/* السرعة Speed Controls */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">السرعة:</span>
                    {[0.75, 1, 1.25, 1.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => changePlaybackSpeed(s)}
                        className={`px-1.5 py-0.5 rounded ${playbackSpeed === s ? "bg-emerald-500 text-black font-bold" : "text-slate-400"}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* أصوات الطبيعة Ambient Noise */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleAmbientSound("rain")}
                      className={`p-1 rounded ${ambientSound === "rain" ? "bg-teal-500 text-black" : "text-slate-400"}`}
                      title="مطر"
                    >
                      <CloudRain className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleAmbientSound("waves")}
                      className={`p-1 rounded ${ambientSound === "waves" ? "bg-teal-500 text-black" : "text-slate-400"}`}
                      title="أمواج"
                    >
                      <Waves className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleAmbientSound("fire")}
                      className={`p-1 rounded ${ambientSound === "fire" ? "bg-teal-500 text-black" : "text-slate-400"}`}
                      title="حطب"
                    >
                      <Flame className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* مؤقت النوم Sleep Timer */}
                  <div className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-emerald-500" />
                    {sleepTimeRemaining ? (
                      <button onClick={cancelSleepTimer} className="text-rose-400 font-mono font-bold">
                        {formatTime(sleepTimeRemaining)}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        {[15, 30, 60].map((m) => (
                          <button key={m} onClick={() => startSleepTimer(m)} className="text-slate-400 hover:text-white">
                            {m}m
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* شريط التقدم الزمني */}
                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* عرض الدبابيس المحفوظة لهذه الأغنية */}
                {currentSongBookmarks.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-1">
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> الدبابيس:
                    </span>
                    {currentSongBookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        onClick={() => handleSeek(bm.time)}
                        className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                      >
                        <span>{bm.label}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeBookmark(bm.id); }} className="text-slate-500 hover:text-red-400">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* شاشة الكلمات المزامنة */}
              <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 space-y-4 sm:space-y-6 text-center scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-800">
                {loadingLyrics ? (
                  <div className="py-20 text-slate-400 dark:text-zinc-500 flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs sm:text-sm font-medium">{t.syncingLyrics}</p>
                  </div>
                ) : lyrics.length > 0 ? (
                  lyrics.map((line, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <div
                        key={`${index}-${line.time}`}
                        ref={isActive ? activeRef : null}
                        onClick={() => handleSeek(line.time)}
                        className="group relative flex flex-col items-center justify-center gap-1 cursor-pointer select-none"
                      >
                        <p
                          className={`transition-all duration-300 ${
                            isActive
                              ? isDark
                                ? "text-emerald-400 text-lg sm:text-2xl font-black scale-105 opacity-100 drop-shadow-[0_0_15px_rgba(52,211,153,0.35)]"
                                : "text-emerald-600 text-lg sm:text-2xl font-black scale-105 opacity-100 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              : isDark
                                ? "text-zinc-500 text-sm sm:text-lg font-semibold opacity-30 hover:opacity-80"
                                : "text-slate-400 text-sm sm:text-lg font-semibold opacity-60 hover:opacity-100"
                          }`}
                        >
                          {line.text}
                        </p>

                        {showTranslation && translations[line.time] && (
                          <p className={`text-xs font-medium transition-opacity ${isActive ? "text-teal-400 opacity-90" : "text-slate-500 dark:text-zinc-600 opacity-40"}`}>
                            {translations[line.time]}
                          </p>
                        )}

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(line.text, index);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-500"
                          >
                            {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              drawQuoteCard(line);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-500"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-400 dark:text-zinc-500 py-20 flex flex-col items-center gap-2">
                    <Mic2 className="w-8 h-8 stroke-[1.5] text-slate-300 dark:text-zinc-600" />
                    <p className="text-xs sm:text-sm">{t.noLyrics}</p>
                  </div>
                )}
              </div>
            </>
          ) : previewSong ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-2 sm:p-6 gap-4 sm:gap-6 animate-fadeIn overflow-y-auto">
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                <img
                  src={previewSong.thumbnail}
                  alt={previewSong.title}
                  className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-xl sm:rounded-2xl object-cover shadow-2xl border border-slate-200 dark:border-zinc-800"
                />

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => setPlaylistModalSong(previewSong)}
                    className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-teal-400 shadow-xl hover:scale-110 transition-transform"
                  >
                    <ListPlus className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => toggleFavorite(previewSong)}
                    className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-rose-500 shadow-xl hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-5 h-5 ${favorites.some((f) => f.videoId === previewSong.videoId) ? "fill-rose-500" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="max-w-lg space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-2xl font-black leading-snug line-clamp-2">{previewSong.title}</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1 sm:pt-2">
                  <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center gap-0.5 ${innerCard}`}>
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500">{t.artistLabel}</span>
                    <span className="text-[11px] font-bold truncate w-full">{previewSong.artist}</span>
                  </div>

                  <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center gap-0.5 ${innerCard}`}>
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500">{t.viewsLabel}</span>
                    <span className="text-[11px] font-bold">
                      {previewSong.views ? previewSong.views.toLocaleString(lang === "ar" ? "ar-EG" : "en-US") : t.na}
                    </span>
                  </div>

                  <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center gap-0.5 ${innerCard}`}>
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500">{t.dateLabel}</span>
                    <span className="text-[11px] font-bold">{previewSong.ago || t.na}</span>
                  </div>

                  <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center gap-0.5 ${innerCard}`}>
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500">{t.durationLabel}</span>
                    <span className="text-[11px] font-bold">{previewSong.duration}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartPlaying(previewSong)}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-6 sm:px-8 py-3 rounded-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 text-xs sm:text-base cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{t.playBtn}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-zinc-500 gap-3">
              <Info className="w-12 h-12 stroke-[1] text-slate-300 dark:text-zinc-600" />
              <p className="text-xs sm:text-sm font-medium px-4 text-center">{t.selectPrompt}</p>
            </div>
          )}

        </section>

      </div>

      {/* النافذة المنبثقة لإضافة الأغنية إلى قائمة */}
      {playlistModalSong && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl max-w-md w-full border shadow-2xl relative space-y-5 ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            
            <button onClick={() => setPlaylistModalSong(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-500">
                <ListPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">{t.addToPlaylistTitle}</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-400 truncate max-w-[240px]">{playlistModalSong.title}</p>
              </div>
            </div>

            {playlists.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">اختر قائمة حالية:</p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {playlists.map((pl) => {
                    const exists = pl.songs.some((s) => s.videoId === playlistModalSong.videoId);
                    return (
                      <div
                        key={pl.id}
                        onClick={() => !exists && addSongToPlaylist(pl.id, playlistModalSong)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          exists
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
                            : isDark
                            ? "bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800 text-zinc-200"
                            : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="text-xs font-bold">{pl.name} ({pl.songs.length})</span>
                        {exists ? (
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> مضافة
                          </span>
                        ) : (
                          <span className="text-[10px] bg-teal-500 text-zinc-950 px-2 py-1 rounded-lg font-bold">
                            {t.addBtn}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t.createNewPlaylistHeader}</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t.newPlaylistPlaceholder}
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className={`flex-1 px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <button
                  onClick={() => createPlaylistAndAddSong(playlistModalSong)}
                  disabled={!newPlaylistName.trim()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1 flex-shrink-0 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.createAndAddBtn}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* وضع الكاريوكي بملء الشاشة */}
      {isKaraoke && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col p-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setKaraokeFontSize((s) => Math.min(s + 4, 48))}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 font-bold text-xs"
              >
                A+
              </button>
              <button
                onClick={() => setKaraokeFontSize((s) => Math.max(s - 4, 16))}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 font-bold text-xs"
              >
                A-
              </button>
            </div>

            <h2 className="text-emerald-400 font-black text-lg tracking-wider">MOON Sound Karaoke 🎤</h2>

            <button onClick={() => setIsKaraoke(false)} className="p-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-12 px-4 space-y-8 text-center scrollbar-none flex flex-col justify-center">
            {lyrics.map((line, index) => {
              const isActive = index === activeIndex;

              return (
                <p
                  key={`karaoke-${index}`}
                  onClick={() => handleSeek(line.time)}
                  style={{ fontSize: isActive ? `${karaokeFontSize + 6}px` : `${karaokeFontSize}px` }}
                  className={`transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "text-emerald-400 font-black scale-110 drop-shadow-[0_0_25px_rgba(52,211,153,0.6)]"
                      : "text-zinc-600 font-bold opacity-30 hover:opacity-70"
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* نافذة بطاقة الاقتباس */}
      {quoteLine && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl max-w-lg w-full flex flex-col items-center gap-4 relative">
            <button onClick={() => setQuoteLine(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{t.createCard}</span>
            </h3>

            <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-black flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>

            <button
              onClick={downloadQuoteCardPNG}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الصورة (PNG)</span>
            </button>
          </div>
        </div>
      )}

      {/* نافذة MOON Drop لإرسال Echo لصديق */}
      {playingSong && (
        <MoonDropModal
          isOpen={showMoonDrop}
          onClose={() => setShowMoonDrop(false)}
          playingSong={playingSong}
          currentTime={currentTime}
          isDark={isDark}
          dir={lang === "ar" ? "rtl" : "ltr"}
        />
      )}
    </main>
  );
}