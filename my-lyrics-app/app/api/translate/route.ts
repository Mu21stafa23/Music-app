import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { lines, targetLang = "ar" } = await request.json();

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ translations: {} });
    }

    // دمج كافة النصوص بفاصل مميز لترجمتها بطلب واحد فقط
    const joinedText = lines.map((l: any) => l.text).join(" \n ");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      joinedText
    )}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ translations: {} });
    }

    const data = await res.json();
    let translatedCombined = "";
    if (Array.isArray(data[0])) {
      translatedCombined = data[0].map((item: any) => item[0]).join("");
    }

    const translatedSplit = translatedCombined.split(" \n ");
    const translations: { [time: number]: string } = {};

    lines.forEach((line: any, idx: number) => {
      translations[line.time] = translatedSplit[idx]?.trim() || line.text;
    });

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("خطأ في ترجمة الكلمات:", error);
    return NextResponse.json({ translations: {} });
  }
}