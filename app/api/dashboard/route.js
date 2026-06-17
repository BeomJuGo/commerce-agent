// 대화 로그 기반 고객 니즈 분석 대시보드 (ADMIN_API_KEY 보호, GET)
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseQuery, handleError } from "@/lib/validate";
import { dashboardQuerySchema } from "@/lib/schemas";
import { chatJSON } from "@/lib/openai";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import { isAuthed } from "@/lib/auth";

export async function GET(req) {
  const limited = rateLimit(req, { name: "dashboard", max: 20, windowMs: 60000 });
  if (limited) return limited;
  // 세션 쿠키 또는 Bearer ADMIN_API_KEY(프로그램 접근) 허용
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized", message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const { data, response } = parseQuery(dashboardQuerySchema, searchParams);
  if (response) return response;

  try {
    let db = null;
    try {
      db = await getDb();
    } catch (_) {}
    if (!db) {
      return NextResponse.json(
        { error: "MongoDB 미설정", message: "대화 로그 저장소가 없어 대시보드를 생성할 수 없습니다." },
        { status: 503 }
      );
    }

    const since = new Date(Date.now() - data.days * 86400000);
    const col = db.collection("conversations");

    const [totalMessages, sessions, intentAgg, userMsgs] = await Promise.all([
      col.countDocuments({ ts: { $gte: since } }),
      col.distinct("sessionId", { ts: { $gte: since } }),
      col
        .aggregate([
          { $match: { ts: { $gte: since }, role: "user" } },
          { $group: { _id: "$detectedIntent", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      col
        .find({ ts: { $gte: since }, role: "user" })
        .sort({ ts: -1 })
        .limit(40)
        .project({ content: 1, _id: 0 })
        .toArray(),
    ]);

    const intents = intentAgg.map((i) => ({ intent: i._id || "general", count: i.count }));

    let needs = { topNeeds: [], trends: "", gaps: "" };
    if (userMsgs.length) {
      needs = await chatJSON(
        [
          {
            role: "user",
            content:
              `다음은 고객 문의 메시지 샘플입니다:\n${userMsgs.map((m, i) => `${i + 1}. ${m.content}`).join("\n")}\n` +
              `고객 니즈를 분석해 JSON으로 응답하세요.\n` +
              `형식: {"topNeeds":[{"need":"니즈","count":추정건수,"examples":["대표 문의"]}],` +
              `"trends":"최근 경향 요약","gaps":"아직 충족되지 않은 니즈/기회"}`,
          },
        ],
        { maxTokens: 2800 }
      );
    }

    return NextResponse.json({
      periodDays: data.days,
      totalMessages,
      sessionCount: sessions.length,
      intents,
      sampleSize: userMsgs.length,
      topNeeds: needs.topNeeds || [],
      trends: needs.trends || "",
      gaps: needs.gaps || "",
    });
  } catch (e) {
    return handleError(e, "대시보드 생성에 실패했습니다.");
  }
}
