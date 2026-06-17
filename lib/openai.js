// lib/openai.js — OpenAI Chat 호출 (pc-site-backend recommend.js / gptInfo.js 패턴 일반화)
// 2회 재시도 · AbortSignal.timeout · 코드펜스/슬라이스로 JSON 추출 · 429 insufficient_quota 시 중단
import logger from "./logger.js";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

// gpt-5 계열·o-시리즈는 커스텀 temperature를 지원하지 않음(기본값 1만 허용) → 전송 생략
function supportsTemperature(model) {
  return !/^(gpt-5|gpt5|o1|o3|o4)/i.test(model);
}

async function callOnce(messages, { model, temperature, maxTokens, timeoutMs }) {
  const body = { model, messages, max_completion_tokens: maxTokens };
  if (temperature != null && supportsTemperature(model)) body.temperature = temperature;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `OpenAI API ${res.status}`);
    err.status = res.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export function hasOpenAI() {
  return !!process.env.OPENAI_API_KEY;
}

export async function chatText(messages, opts = {}) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY 미설정");
  const cfg = {
    model: opts.model || DEFAULT_MODEL,
    temperature: opts.temperature ?? 0.5,
    maxTokens: opts.maxTokens || 600,
    timeoutMs: opts.timeoutMs || 30000,
  };

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await callOnce(messages, cfg);
    } catch (e) {
      lastErr = e;
      // 할당량 소진/인증 오류는 재시도해도 무의미 → 즉시 중단
      if (e.status === 401) break;
      if (e.status === 429 && e.code === "insufficient_quota") break;
      logger.warn(`OpenAI 재시도(${attempt + 1}/2): ${e.message}`);
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

function extractJSON(text) {
  let t = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

// 항상 단일 JSON 객체를 강제하고, 코드펜스/잡텍스트가 섞여도 슬라이스로 복구
export async function chatJSON(messages, opts = {}) {
  const sys = {
    role: "system",
    content:
      "You are a helpful Korean commerce assistant. Respond with a single valid JSON object only — no markdown fences, no prose, no explanation.",
  };
  const msgs = messages[0]?.role === "system" ? messages : [sys, ...messages];
  const text = await chatText(msgs, { temperature: 0.3, maxTokens: 900, ...opts });
  try {
    return extractJSON(text);
  } catch (e) {
    logger.error(`chatJSON 파싱 실패: ${e.message}`);
    const err = new Error("AI 응답 파싱에 실패했습니다.");
    err.raw = text;
    throw err;
  }
}
