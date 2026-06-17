// lib/store.js — 스토어 카테고리 정의 (카테고리당 여러 키워드를 섞어 다양하게 진열)
export const CATEGORIES = [
  { slug: "digital", label: "가전·디지털", queries: ["노트북", "무선이어폰", "모니터", "로봇청소기"] },
  { slug: "fashion", label: "패션의류", queries: ["남자 패딩", "여성 코트", "스니커즈", "백팩"] },
  { slug: "living", label: "홈·리빙", queries: ["공기청정기", "수납장", "무드등", "디퓨저"] },
  { slug: "sports", label: "스포츠·레저", queries: ["캠핑용품", "요가매트", "자전거", "등산화"] },
  { slug: "beauty", label: "뷰티", queries: ["스킨케어 세트", "향수", "헤어드라이어", "쿠션 팩트"] },
  { slug: "food", label: "식품", queries: ["간편식", "원두커피", "견과류", "비타민"] },
];

export function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
