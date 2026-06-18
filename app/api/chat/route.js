// 쇼핑몰 고객 응대 AI 위젯 백엔드 — 스토어 상품/현재상품/장바구니 컨텍스트 연결
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { chatSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatText, FAST_MODEL } from "@/lib/openai";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import { productKey, cacheProducts } from "@/lib/products";
import logger from "@/lib/logger";

const PRODUCT_INTENT = /추천|가격|얼마|사고|구매|제품|상품|찾|비교|배송|재고|사이즈|색상|어때|비슷|저렴|싸|후기|리뷰|장점|단점/;

export async function POST(req) {
  const limited = rateLimit(req, { name: "chat", max: 15, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(chatSchema, req);
  if (response) return response;

  const { sessionId, message, shopContext, currentProduct, cart } = data;
  try {
    let db = null;
    try {
      db = await getDb();
    } catch (_) {}

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

    // ── 컨텍스트 구성: 현재 상품 + 장바구니 ──
    const ctxParts = [];
    if (currentProduct?.title) {
      ctxParts.push(
        `[고객이 지금 보고 있는 상품] ${currentProduct.title}${currentProduct.lprice ? ` (${currentProduct.lprice}원)` : ""}`
      );
    }
    if (Array.isArray(cart) && cart.length) {
      const total = cart.reduce((n, c) => n + (Number(c.lprice) || 0) * (c.qty || 1), 0);
      ctxParts.push(
        `[고객 장바구니] ${cart.map((c) => `${c.title}×${c.qty || 1}`).join(", ")} · 합계 약 ${total.toLocaleString("ko-KR")}원`
      );
    }

    // ── 상품 문의면 우리 스토어(네이버) 검색 → pkey 부여 + 캐시(상세 연결) ──
    let products = [];
    let detectedIntent = "general";
    if (PRODUCT_INTENT.test(message)) {
      detectedIntent = "product_inquiry";
      try {
        const q = currentProduct?.title && /비슷|유사|이런|같은/.test(message) ? currentProduct.title : message;
        const items = await searchShop(q, { display: 5 });
        products = items.map((it) => ({
          pkey: productKey(it),
          title: it.title,
          image: it.image || null,
          lprice: it.lprice || null,
          mallName: it.mallName || null,
        }));
        await cacheProducts(products);
      } catch (_) {}
    }

    const productContext = products.length
      ? "\n\n[스토어 추천 후보 — 자연스럽게 설명/비교에 활용. 이 상품들은 화면에 카드로 함께 표시되니 답변에 URL은 넣지 말 것]\n" +
        products.map((p, i) => `${i + 1}. ${p.title} (${p.lprice ? p.lprice + "원" : "가격미상"})`).join("\n")
      : "";

    const sys = {
      role: "system",
      content:
        `당신은 ${shopContext || "COMMERCE STORE"}의 친절한 고객 응대 상담원입니다. 한국어로 간결하고 도움이 되게 답하세요.` +
        (ctxParts.length ? `\n${ctxParts.join("\n")}` : "") +
        `\n추천 상품은 화면에 카드로 함께 표시됩니다. 답변에는 URL/링크를 넣지 말고, 상품을 자연스럽게 설명·비교해 주세요. 모르는 정보는 추측하지 말고 솔직히 안내하세요.` +
        productContext,
    };
    const msgs = [sys, ...history.map((h) => ({ role: h.role, content: h.content })), { role: "user", content: message }];
    // 고객 응대는 빠른 모델로(지연 단축). 대화 품질엔 충분, 추론모델이면 temperature 자동 생략.
    const reply = await chatText(msgs, { model: FAST_MODEL, temperature: 0.6, maxTokens: 500 });

    if (db) {
      const ts = new Date();
      db.collection("conversations")
        .insertMany([
          { sessionId, role: "user", content: message, ts, detectedIntent },
          { sessionId, role: "assistant", content: reply, ts: new Date(ts.getTime() + 1), detectedIntent },
        ])
        .catch((e) => logger.error(`chat 로그 저장 실패: ${e.message}`));
    }

    return NextResponse.json({ sessionId, reply, detectedIntent, logged: !!db, products });
  } catch (e) {
    logger.error(`chat 실패: ${e.message}`);
    return handleError(e, "응대 생성에 실패했습니다.");
  }
}
