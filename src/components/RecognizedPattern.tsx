import { useRef, useState } from 'react';
import type { RecognizedPattern } from '../types';

interface Props {
  pattern: RecognizedPattern;
}

const CELL_PX = 10;

export default function RecognizedPatternView({ pattern }: Props) {
  const { cols, rows, cells } = pattern;
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ code: string; hex: string; x: number; y: number } | null>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current!.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / CELL_PX);
    const row = Math.floor((e.clientY - rect.top) / CELL_PX);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const cell = cells[row]?.[col];
      if (cell) {
        setTooltip({
          code: cell.color.code,
          hex: cell.color.hex,
          x: e.clientX - rect.left + 12,
          y: e.clientY - rect.top + 12,
        });
        return;
      }
    }
    setTooltip(null);
  }

  return (
    <div className="pattern-wrap">
      <h2 className="section-title">识别结果 <span className="dim">{cols} × {rows} 格</span></h2>
      <div className="pattern-scroll">
        <div
          ref={containerRef}
          className="pattern-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)`,
            width: cols * CELL_PX,
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {cells.flat().map((cell, i) => (
            <div
              key={i}
              className="pattern-cell"
              style={{ backgroundColor: cell.color.hex }}
            />
          ))}
        </div>
        {tooltip && (
          <div className="pattern-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <span className="pattern-tooltip__swatch" style={{ backgroundColor: tooltip.hex }} />
            {tooltip.code}
          </div>
        )}
      </div>
    </div>
  );
}
