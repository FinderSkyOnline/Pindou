import type { ColorUsage } from '../types';

interface Props {
  summary: ColorUsage[];
}

export default function ColorSummary({ summary }: Props) {
  const total = summary.reduce((s, c) => s + c.count, 0);

  return (
    <div className="summary">
      <h2 className="section-title">用色统计 <span className="dim">共 {summary.length} 种 · {total} 颗</span></h2>
      <div className="summary__list">
        {summary.map(({ color, count }) => (
          <div key={color.code} className="summary__row">
            <span className="summary__swatch" style={{ backgroundColor: color.hex }} />
            <span className="summary__code">{color.code}</span>
            <span className="summary__count">{count} 颗</span>
            <div className="summary__bar-wrap">
              <div className="summary__bar" style={{ width: `${(count / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
