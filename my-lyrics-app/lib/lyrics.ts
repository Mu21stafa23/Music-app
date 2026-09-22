export interface LyricLine {
  time: number;
  text: string;
}

export async function fetchLyrics(trackName: string, artistName?: string): Promise<LyricLine[]> {
  try {
    const cleanTrack = trackName.replace(/\(Official.*?\)|\[.*?\]/gi, "").trim();

    // 1. طلب دقيق بالاسم والفنان
    if (artistName) {
      const res = await fetch(
        `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTrack)}&artist_name=${encodeURIComponent(artistName)}`
      );
      if (res.ok) {
        const data = await res.json();
        const rawLrc = data.syncedLyrics || data.plainLyrics;
        if (rawLrc) return parseLRC(rawLrc);
      }
    }

    // 2. البحث العام
    const query = artistName ? `${cleanTrack} ${artistName}` : cleanTrack;
    const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
    if (searchRes.ok) {
      const results = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const syncedMatch = results.find((item: any) => item.syncedLyrics);
        const match = syncedMatch || results[0];
        const rawLrc = match?.syncedLyrics || match?.plainLyrics;
        if (rawLrc) return parseLRC(rawLrc);
      }
    }
  } catch (e) {
    console.error("خطأ في جلب الكلمات:", e);
  }
  return [];
}

export function parseLRC(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const matches = Array.from(line.matchAll(timeRegex));
    if (matches.length > 0) {
      const text = line.replace(timeRegex, "").trim();
      if (!text) continue;

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const msStr = match[3] || "0";
        const ms = parseInt(msStr, 10);
        const totalSeconds = minutes * 60 + seconds + ms / (msStr.length === 3 ? 1000 : 100);

        result.push({ time: totalSeconds, text });
      }
    }
  }

  // ترتيب الكلمات حسب التوقيت الزمني
  return result.sort((a, b) => a.time - b.time);
}