// components/Sparkline.js — 작은 추세 스파크라인(SVG, 의존성 없음)
export default function Sparkline({ series, width = 130, height = 34 }) {
  if (!series?.length || series.length < 2) return null;
  const ratios = series.map((s) => s.ratio);
  const max = Math.max(...ratios);
  const min = Math.min(...ratios);
  const range = max - min || 1;
  const n = ratios.length;

  const xy = (r, i) => {
    const x = (i / (n - 1)) * (width - 4) + 2;
    const y = height - 2 - ((r - min) / range) * (height - 6);
    return [x, y];
  };

  const points = ratios.map((r, i) => xy(r, i).join(",")).join(" ");
  const peakIdx = ratios.indexOf(max);
  const [px, py] = xy(max, peakIdx);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={points} fill="none" stroke="#e0480f" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px} cy={py} r="2.2" fill="#ff5c1a" />
    </svg>
  );
}
