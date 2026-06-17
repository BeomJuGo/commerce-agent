// 여행/계절/라이프스타일 기반 쇼핑 큐레이션 서비스
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { curationSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rateLimit";
import { runCuration } from "@/lib/curate";
import logger from "@/lib/logger";

export async function POST(req) {
  const limited = rateLimit(req, { name: "curation", max: 10, windowMs: 60000 });
  if (limited) return limited;

  const { data, response } = await parseBody(curationSchema, req);
  if (response) return response;

  try {
    return NextResponse.json(await runCuration(data.context));
  } catch (e) {
    logger.error(`curation 실패: ${e.message}`);
    return handleError(e, "큐레이션 생성에 실패했습니다.");
  }
}
