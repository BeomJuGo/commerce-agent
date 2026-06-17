// lib/store.js — 스토어 카테고리 (카테고리당 키워드 8개 → 병합 시 500개+ 확보)
export const CATEGORIES = [
  {
    slug: "digital",
    label: "가전·디지털",
    queries: ["노트북", "무선이어폰", "모니터", "로봇청소기", "블루투스 스피커", "외장SSD", "기계식 키보드", "보조배터리"],
  },
  {
    slug: "fashion",
    label: "패션의류",
    queries: ["남자 패딩", "여성 코트", "스니커즈", "백팩", "후드티", "청바지", "원피스", "크로스백"],
  },
  {
    slug: "living",
    label: "홈·리빙",
    queries: ["공기청정기", "수납장", "무드등", "디퓨저", "이불세트", "커튼", "식기건조대", "가습기"],
  },
  {
    slug: "sports",
    label: "스포츠·레저",
    queries: ["캠핑용품", "요가매트", "자전거", "등산화", "덤벨", "텐트", "골프공", "러닝화"],
  },
  {
    slug: "beauty",
    label: "뷰티",
    queries: ["스킨케어 세트", "향수", "헤어드라이어", "쿠션 팩트", "선크림", "샴푸", "마스크팩", "립밤"],
  },
  {
    slug: "food",
    label: "식품",
    queries: ["간편식", "원두커피", "견과류", "비타민", "닭가슴살", "과자", "생수", "라면"],
  },
];

export function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
