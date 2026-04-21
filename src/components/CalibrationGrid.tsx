import { useRef } from 'react';
import type { CalibrationState } from '../types';

const MIN_CELL = 8;
const HANDLE_R = 7;

interface Props {
  calibration: CalibrationState;
  onChange: (next: CalibrationState) => void;
  containerW: number;
  containerH: number;
}

type DragMode =
  | { type: 'none' }
  | { type: 'move'; sx: number; sy: number; ox: number; oy: number }
  | { type: 'resize'; corner: 'NW' | 'NE' | 'SW' | 'SE'; sx: number; sy: number; snap: CalibrationState };

export default function CalibrationGrid({ calibration, onChange, containerW, containerH }: Props) {
  const modeRef = useRef<DragMode>({ type: 'none' });
  const { x, y, cellW, cellH } = calibration;
  const gridW = cellW * 3;
  const gridH = cellH * 3;

  function clamp(cal: CalibrationState): CalibrationState {
    return {
      ...cal,
      cellW: Math.max(MIN_CELL, cal.cellW),
      cellH: Math.max(MIN_CELL, cal.cellH),
      x: Math.max(-gridW + 20, Math.min(containerW - 20, cal.x)),
      y: Math.max(-gridH + 20, Math.min(containerH - 20, cal.y)),
    };
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const m = modeRef.current;
    if (m.type === 'none') return;

    if (m.type === 'move') {
      onChange(clamp({
        ...calibration,
        x: m.ox + e.clientX - m.sx,
        y: m.oy + e.clientY - m.sy,
      }));
    } else {
      const dx = e.clientX - m.sx;
      const dy = e.clientY - m.sy;
      const s = m.snap;
      let nx = s.x, ny = s.y, ncW = s.cellW, ncH = s.cellH;

      if (m.corner === 'SE') {
        ncW = Math.max(MIN_CELL, (s.cellW * 3 + dx) / 3);
        ncH = Math.max(MIN_CELL, (s.cellH * 3 + dy) / 3);
      } else if (m.corner === 'NW') {
        ncW = Math.max(MIN_CELL, (s.cellW * 3 - dx) / 3);
        ncH = Math.max(MIN_CELL, (s.cellH * 3 - dy) / 3);
        nx = s.x + s.cellW * 3 - ncW * 3;
        ny = s.y + s.cellH * 3 - ncH * 3;
      } else if (m.corner === 'NE') {
        ncW = Math.max(MIN_CELL, (s.cellW * 3 + dx) / 3);
        ncH = Math.max(MIN_CELL, (s.cellH * 3 - dy) / 3);
        ny = s.y + s.cellH * 3 - ncH * 3;
      } else {
        // SW
        ncW = Math.max(MIN_CELL, (s.cellW * 3 - dx) / 3);
        ncH = Math.max(MIN_CELL, (s.cellH * 3 + dy) / 3);
        nx = s.x + s.cellW * 3 - ncW * 3;
      }
      onChange(clamp({ x: nx, y: ny, cellW: ncW, cellH: ncH }));
    }
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    modeRef.current = { type: 'none' };
  }

  function startMove(e: React.PointerEvent) {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    modeRef.current = { type: 'move', sx: e.clientX, sy: e.clientY, ox: x, oy: y };
  }

  function startResize(corner: 'NW' | 'NE' | 'SW' | 'SE') {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      modeRef.current = { type: 'resize', corner, sx: e.clientX, sy: e.clientY, snap: { ...calibration } };
    };
  }

  // Generate grid lines
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= 3; i++) {
    lines.push(<line key={`v${i}`} x1={x + i * cellW} y1={y} x2={x + i * cellW} y2={y + gridH} />);
    lines.push(<line key={`h${i}`} x1={x} y1={y + i * cellH} x2={x + gridW} y2={y + i * cellH} />);
  }

  const corners: { id: 'NW' | 'NE' | 'SW' | 'SE'; cx: number; cy: number }[] = [
    { id: 'NW', cx: x, cy: y },
    { id: 'NE', cx: x + gridW, cy: y },
    { id: 'SW', cx: x, cy: y + gridH },
    { id: 'SE', cx: x + gridW, cy: y + gridH },
  ];

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: containerW, height: containerH, overflow: 'visible', cursor: 'default' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* grid lines */}
      <g stroke="#00e5ff" strokeWidth="1.5" opacity="0.9">
        {lines}
      </g>
      {/* semi-transparent fill */}
      <rect x={x} y={y} width={gridW} height={gridH} fill="#00e5ff" fillOpacity="0.08" />
      {/* drag handle (invisible overlay on grid interior) */}
      <rect
        x={x + HANDLE_R}
        y={y + HANDLE_R}
        width={gridW - HANDLE_R * 2}
        height={gridH - HANDLE_R * 2}
        fill="transparent"
        cursor="move"
        onPointerDown={startMove}
      />
      {/* corner resize handles */}
      {corners.map(({ id, cx, cy }) => (
        <circle
          key={id}
          cx={cx}
          cy={cy}
          r={HANDLE_R}
          fill="#00e5ff"
          stroke="#fff"
          strokeWidth="1.5"
          cursor={id === 'NW' || id === 'SE' ? 'nwse-resize' : 'nesw-resize'}
          onPointerDown={startResize(id)}
        />
      ))}
      {/* label */}
      <text x={x + 4} y={y - 6} fill="#00e5ff" fontSize="11" fontFamily="sans-serif">
        {`${Math.round(cellW)}×${Math.round(cellH)} px/格`}
      </text>
    </svg>
  );
}
