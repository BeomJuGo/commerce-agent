// lib/store.js — 스토어 카테고리 정의 (홈 진열 rail + 카테고리 검색에 사용)
export const CATEGORIES = [
  { slug: "digital", label: "가전·디지털", q: "노트북" },
  { slug: "fashion", label: "패션의류", q: "남자 패딩" },
  { slug: "living", label: "홈·리빙", q: "공기청정기" },
  { slug: "sports", label: "스포츠·레저", q: "캠핑용품" },
  { slug: "beauty", label: "뷰티", q: "스킨케어 세트" },
  { slug: "food", label: "식품", q: "간편식" },
];

export function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
