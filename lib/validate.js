// lib/validate.js — App Router용 검증/에러 헬퍼
// Express 미들웨어(req,res,next)는 route handler에 맞지 않으므로 함수형으로 변환.
// 성공 시 { data }, 실패 시 { response: NextResponse(400) } 를 반환한다.
import { NextResponse } from "next/server";

function formatIssues(result) {
  return result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
}

export async function parseBody(schema, req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return { response: NextResponse.json({ error: "요청 본문이 올바른 JSON이 아닙니다." }, { status: 400 }) };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: formatIssues(result) },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}

export function parseQuery(schema, searchParams) {
  const obj = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(obj);
  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: formatIssues(result) },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}

// 관리자 인증 (pc-site-backend requireAdminKey 이식)
export function checkAdmin(req) {
  const configured = process.env.ADMIN_API_KEY;
  if (!configured) {
    return NextResponse.json(
      { error: "Server Misconfiguration", message: "ADMIN_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== configured) {
    return NextResponse.json({ error: "Unauthorized", message: "유효하지 않은 API 키입니다." }, { status: 401 });
  }
  return null;
}

// 공통 에러 응답. 외부 의존성(Mongo/OpenAI/Naver) 미설정·장애는 503으로 구분.
export function handleError(e, label = "요청 처리에 실패했습니다.") {
  const msg = e?.message || String(e);
  const unavailable = /미설정|insufficient_quota|ECONNREFUSED|503/.test(msg) || e?.status === 503;
  const status = unavailable ? 503 : 500;
  return NextResponse.json({ error: label, detail: msg }, { status });
}
