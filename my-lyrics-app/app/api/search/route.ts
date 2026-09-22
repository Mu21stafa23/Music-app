import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q) return NextResponse.json({ results: [] });

  try {
    const response = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    );
    const html = await response.text();
    
    const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    let results: any[] = [];

    if (jsonMatch && jsonMatch) {
      const data = JSON.parse(jsonMatch);
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

      for (const item of contents) {
        const video = item.videoRenderer;
        if (video) {
          const thumbUrl = video.thumbnail?.thumbnails && video.thumbnail.thumbnails.length > 0 
            ? video.thumbnail.thumbnails[0].url 
            : `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

          results.push({
            videoId: video.videoId,
            title: video.title?.runs?.[0]?.text || 'No title',
            thumbnail: thumbUrl,
            artist: video.ownerText?.runs?.[0]?.text || video.longBylineText?.runs?.[0]?.text || '',
            duration: video.lengthText?.simpleText || '03:00',
            views: 0,
            ago: video.publishedTimeText?.simpleText || '',
          });
        }
        if (results.length >= 10) break;
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Lightweight search error:', error);
    return NextResponse.json({ results: [] });
  }
}