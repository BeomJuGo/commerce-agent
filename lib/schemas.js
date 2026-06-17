// lib/schemas.js — 엔드포인트별 zod 스키마 (pc-site-backend schemas/*.js 스타일)
import { z } from "zod";

export const recommendSchema = z.object({
  situation: z.string().trim().min(2, "상황 설명을 2자 이상 입력하세요.").max(500),
  budget: z.coerce.number().int().positive().optional(),
});

export const compareSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().trim().min(1).optional(),
        productId: z.string().trim().min(1).optional(),
      })
    )
    .min(2, "비교할 상품을 2개 이상 입력하세요.")
    .max(5),
  criteria: z.string().trim().max(300).optional(),
});

export const reviewSchema = z.object({
  productName: z.string().trim().min(2, "상품명을 2자 이상 입력하세요.").max(200),
});

export const chatSchema = z.object({
  sessionId: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1, "메시지를 입력하세요.").max(1000),
  shopContext: z.string().trim().max(500).optional(),
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

export const linksPostSchema = z
  .object({
    url: z.string().trim().regex(/^https?:\/\/.+/, "유효한 URL이 아닙니다.").optional(),
    query: z.string().trim().min(1).max(200).optional(),
    memo: z.string().trim().max(500).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  })
  .refine((v) => v.url || v.query, {
    message: "url 또는 query 중 하나는 필수입니다.",
  });

export const linksQuerySchema = z.object({
  tag: z.string().trim().max(40).optional(),
  q: z.string().trim().max(100).optional(),
});

export const linksDeleteQuerySchema = z.object({
  id: z.string().trim().min(1, "삭제할 id가 필요합니다."),
});

export const curationSchema = z.object({
  context: z.object({
    type: z.enum(["travel", "season", "lifestyle"]),
    detail: z.string().trim().min(2, "상세 내용을 2자 이상 입력하세요.").max(300),
  }),
});
