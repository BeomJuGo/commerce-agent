// 쇼핑몰 고객 응대 AI 위젯 백엔드 (대화 로그를 conversations에 저장)
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { chatSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatText } from "@/lib/openai";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import logger from "@/lib/logger";

const PRODUCT_INTENT = /추천|가격|얼마|사고|구매|제품|상품|찾|비교|배송|재고|사이즈|색상/;

export async function POST(req) {
  const limited = rateLimit(req, { name: "chat", max: 15, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(chatSchema, req);
  if (response) return response;

  const { sessionId, message, shopContext } = data;
  try {
    let db = null;
    try {
      db = await getDb();
    } catch (_) {}

    // 직전 대화 turn 로드
    let history = [];
    if (db) {
      history = await db
        .collection("conversations")
        .find({ sessionId })
        .sort({ ts: 1 })
        .limit(10)
        .toArray()
        .catch(() => []);
    }

    // 상품 문의면 검색 결과를 컨텍스트로 주입
    let productContext = "";
    let detectedIntent = "general";
    if (PRODUCT_INTENT.test(message)) {
      detectedIntent = "product_inquiry";
      try {
        const items = await searchShop(message, { display: 4 });
        if (items.length) {
          productContext =
            "\n\n참고 상품(네이버 쇼핑):\n" +
            items.map((i) => `- ${i.title} (${i.lprice ? i.lprice + "원" : ""}) ${i.link}`).join("\n");
        }
      } catch (_) {}
    }

    const sys = {
      role: "system",
      content:
        `당신은 ${shopContext || "온라인 쇼핑몰"}의 친절한 고객 응대 상담원입니다. ` +
        `한국어로 간결하고 도움이 되게 답하세요. 상품 문의 시 아래 참고 상품을 활용하되, ` +
        `모르는 정보는 추측하지 말고 솔직히 안내하세요.${productContext}`,
    };
    const msgs = [sys, ...history.map((h) => ({ role: h.role, content: h.content })), { role: "user", content: message }];
    const reply = await chatText(msgs, { temperature: 0.6, maxTokens: 500 });

    // user/assistant turn 저장
    if (db) {
      const ts = new Date();
      db.collection("conversations")
        .insertMany([
          { sessionId, role: "user", content: message, ts, detectedIntent },
          { sessionId, role: "assistant", content: reply, ts: new Date(ts.getTime() + 1), detectedIntent },
        ])
        .catch((e) => logger.error(`chat 로그 저장 실패: ${e.message}`));
    }

    return NextResponse.json({ sessionId, reply, detectedIntent, logged: !!db });
  } catch (e) {
    logger.error(`chat 실패: ${e.message}`);
    return handleError(e, "응대 생성에 실패했습니다.");
  }
}
