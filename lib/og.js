// lib/og.js — 임의 상품 URL(쿠팡/자사몰 등)의 OpenGraph 메타 보강
function decodeEntities(s = "") {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .trim();
}

function metaContent(html, prop) {
  const a = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i");
  const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, "i");
  return (html.match(a)?.[1] || html.match(b)?.[1] || "").trim();
}

// 출처 라벨 (쿠팡/네이버/11번가/G마켓/자사몰 등)
export function detectSource(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("coupang")) return "쿠팡";
    if (host.includes("naver")) return "네이버";
    if (host.includes("11st")) return "11번가";
    if (host.includes("gmarket")) return "G마켓";
    if (host.includes("auction")) return "옥션";
    return host; // 자사몰/기타 도메인
  } catch {
    return "기타";
  }
}

// 실패해도 throw하지 않고 {} 반환 — 쿠팡 등 봇 차단 시 graceful degradation
export async function fetchOg(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const html = (await res.text()).slice(0, 300000);

    const title = metaContent(html, "og:title") || (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "");
    const image = metaContent(html, "og:image");
    const priceRaw =
      metaContent(html, "og:price:amount") ||
      metaContent(html, "product:price:amount") ||
      metaContent(html, "product:price");
    const price = priceRaw ? Number(String(priceRaw).replace(/[^0-9]/g, "")) || null : null;

    return {
      title: decodeEntities(title) || null,
      image: image || null,
      price,
    };
  } catch {
    return {};
  }
}
