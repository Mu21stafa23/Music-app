import { NextResponse } from "next/server";
import ytSearch from "yt-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "اسم الأغنية أو الفنان مطلوب" }, { status: 400 });
  }

  try {
    const searchResult = await ytSearch(q);
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    const results = [];
    for (const video of searchResult.videos) {
      const cleanTitle = video.title.toLowerCase().trim();
      if (!seenIds.has(video.videoId) && !seenTitles.has(cleanTitle)) {
        seenIds.add(video.videoId);
        seenTitles.add(cleanTitle);
        results.push({
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.image || video.thumbnail,
          artist: video.author.name,
          duration: video.timestamp,
          views: video.views,       // عدد المشاهدات
          ago: video.ago,           // تاريخ النشر / السنة
        });
      }
      if (results.length >= 10) break;
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ أثناء البحث" }, { status: 500 });
  }
}