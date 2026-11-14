import { useRef, useState } from 'react';

// smooth line through points (Catmull-Rom -> cubic bezier)
function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function AreaChart({ data, valueKey, format = (v) => v, height = 230 }) {
  const W = 640, H = height, L = 38, R = 14, T = 16, B = 28;
  const wrap = useRef(null);
  const [hover, setHover] = useState(null);
  const vals = data.map((d) => d[valueKey]);
  const max = Math.max(4, ...vals);
  const niceMax = Math.ceil(max / 4) * 4;
  const x = (i) => L + (i * (W - L - R)) / Math.max(1, data.length - 1);
  const y = (v) => T + (1 - v / niceMax) * (H - T - B);
  const pts = data.map((d, i) => [x(i), y(d[valueKey])]);
  const line = smooth(pts);
  const area = pts.length ? `${line} L${x(data.length - 1)},${H - B} L${x(0)},${H - B} Z` : '';
  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - L) / (W - L - R)) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };
  const h = hover === null ? null : data[hover];
  return (
    <div className="a-chart" ref={wrap} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chart">
        <defs>
          <linearGradient id="evFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a1b35" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#7a1b35" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((k) => {
          const v = (niceMax / 4) * k;
          return (
            <g key={k}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" />
              <text x={L - 8} y={y(v) + 4} textAnchor="end" className="tick">{Number.isInteger(v) ? v : v.toFixed(1)}</text>
            </g>
          );
        })}
        {data.map((d, i) => (i % 2 === 0 || data.length < 8) && (
          <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" className="tick">{d.date.slice(5).replace('-', '/')}</text>
        ))}
        <path d={area} fill="url(#evFill)" className="area" />
        <path d={line} className="line" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} className="cursor" />
            <circle cx={x(hover)} cy={y(h[valueKey])} r="5" className="dot" />
          </g>
        )}
      </svg>
      {h && (
        <div className="a-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{format(h[valueKey])}</b><span>{h.date}</span>
        </div>
      )}
    </div>
  );
}

export function Donut({ segments, size = 170, label = 'Total' }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 62, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="a-donut">
      <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label="Orders by status">
        <circle cx="80" cy="80" r={r} className="track" />
        {total > 0 && segments.filter((s) => s.value > 0).map((s) => {
          const len = (s.value / total) * c;
          const el = <circle key={s.label} cx="80" cy="80" r={r} stroke={s.color} strokeDasharray={`${Math.max(0, len - 3)} ${c}`} strokeDashoffset={-offset} className="seg" />;
          offset += len;
          return el;
        })}
        <text x="80" y="78" textAnchor="middle" className="big">{total}</text>
        <text x="80" y="98" textAnchor="middle" className="small">{label}</text>
      </svg>
      <ul>
        {segments.map((s) => (
          <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{s.value}</b></li>
        ))}
      </ul>
    </div>
  );
}
