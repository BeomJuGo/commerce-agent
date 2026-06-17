// 여행/계절/라이프스타일 기반 쇼핑 큐레이션 서비스
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { curationSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatJSON } from "@/lib/openai";
import logger from "@/lib/logger";

export async function POST(req) {
  const { data, response } = await parseBody(curationSchema, req);
  if (response) return response;

  const { context } = data;
  try {
    const themeRes = await chatJSON(
      [
        {
          role: "user",
          content:
            `여행/계절/라이프스타일 기반 쇼핑 큐레이션을 만드세요.\n` +
            `맥락 유형: ${context.type}\n상세: "${context.detail}"\n` +
            `형식: {"title":"큐레이션 제목","intro":"소개 1~2문장",` +
            `"themes":[{"theme":"테마명","description":"테마 설명","searchKeyword":"네이버 검색 키워드"}]}\n` +
            `테마는 3~5개로 구성하세요.`,
        },
      ],
      { maxTokens: 1000 }
    );

    const themes = [];
    for (const t of (themeRes.themes || []).slice(0, 5)) {
      let products = [];
      try {
        products = await searchShop(t.searchKeyword || t.theme, { display: 4 });
      } catch (_) {}
      themes.push({ theme: t.theme, description: t.description, products });
    }

    return NextResponse.json({
      type: context.type,
      title: themeRes.title || "",
      intro: themeRes.intro || "",
      themes,
    });
  } catch (e) {
    logger.error(`curation 실패: ${e.message}`);
    return handleError(e, "큐레이션 생성에 실패했습니다.");
  }
}
