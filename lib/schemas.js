// lib/schemas.js — 엔드포인트별 zod 스키마 (pc-site-backend schemas/*.js 스타일)
import { z } from "zod";

export const recommendSchema = z.object({
  situation: z.string().trim().min(2, "상황 설명을 2자 이상 입력하세요.").max(500),
  budget: z.coerce.number().int().positive().optional(),
});

export const reviewSchema = z.object({
  productName: z.string().trim().min(2, "상품명을 2자 이상 입력하세요.").max(200),
});

export const chatSchema = z.object({
  sessionId: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1, "메시지를 입력하세요.").max(1000),
  shopContext: z.string().trim().max(500).optional(),
  // 현재 보고 있는 상품 / 장바구니 컨텍스트 (위젯이 전달)
  currentProduct: z
    .object({
      pkey: z.string().max(200).optional(),
      title: z.string().max(300),
      lprice: z.coerce.number().nullable().optional(),
    })
    .optional(),
  cart: z
    .array(
      z.object({
        title: z.string().max(300),
        qty: z.coerce.number().int().optional(),
        lprice: z.coerce.number().nullable().optional(),
      })
    )
    .max(50)
    .optional(),
});

export const dashboardQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const sourcingSchema = z
  .object({
    category: z.string().trim().max(100).optional(),
    keyword: z.string().trim().max(100).optional(),
    marginTarget: z.coerce.number().min(0).max(100).optional(),
  })
  .refine((v) => v.category || v.keyword, {
    message: "category 또는 keyword 중 하나는 필수입니다.",
  });

export const linksPostSchema = z.object({
  url: z.string().trim().regex(/^https?:\/\/.+/, "쿠팡/자사몰 상품 URL을 입력하세요."),
  title: z.string().trim().max(200).optional(),
  price: z.coerce.number().int().nonnegative().optional(), // 수동 가격(쿠팡 등 자동수집 불가 시)
  memo: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
});

// 가격 갱신: price 주면 수동 기록, 없으면 OG 재조회
export const linksPatchSchema = z.object({
  id: z.string().trim().min(1),
  price: z.coerce.number().int().nonnegative().optional(),
});

export const linksQuerySchema = z.object({
  tag: z.string().trim().max(40).optional(),
  q: z.string().trim().max(100).optional(),
});

export const linksDeleteQuerySchema = z.object({
  id: z.string().trim().min(1, "삭제할 id가 필요합니다."),
});

export const loginSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력하세요.").max(200),
});

export const trendAnalysisSchema = z.object({
  keyword: z.string().trim().min(1).max(100),
  momentum: z.coerce.number().optional(),
  direction: z.string().trim().max(10).optional(),
  peakMonth: z.coerce.number().int().min(1).max(12).optional(),
  series: z
    .array(z.object({ period: z.string().max(10), ratio: z.coerce.number() }))
    .max(24)
    .optional(),
});

export const curationSchema = z.object({
  context: z.object({
    type: z.enum(["travel", "season", "lifestyle"]),
    detail: z.string().trim().min(2, "상세 내용을 2자 이상 입력하세요.").max(300),
  }),
});
