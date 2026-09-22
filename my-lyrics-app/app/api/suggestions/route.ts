import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`
    );
    const data = await res.json();
    // تصفية الاقتراحات وأخذ أول 5 اقتراحات غير فارغة
    const rawSuggestions: string[] = data[1] || [];
    const suggestions = rawSuggestions
      .filter((item) => item && item.trim().length > 0)
      .slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ suggestions: [] });
  }
}