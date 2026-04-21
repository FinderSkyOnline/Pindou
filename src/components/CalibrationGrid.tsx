import { useRef, useState, useLayoutEffect } from 'react';
import type { CalibrationState } from '../types';

const MIN_CELL = 3;
const HANDLE_R = 8;

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
  // Local state drives SVG rendering — no React re-render overhead during drag
  const [local, setLocal] = useState<CalibrationState>(calibration);
  const modeRef = useRef<DragMode>({ type: 'none' });
  const localRef = useRef<CalibrationState>(calibration);

  // Sync external calibration changes (e.g. reset) into local state
  useLayoutEffect(() => {
    localRef.current = calibration;
    setLocal(calibration);
  }, [calibration]);

  function update(next: CalibrationState) {
    const clamped: CalibrationState = {
      cellW: Math.max(MIN_CELL, next.cellW),
      cellH: Math.max(MIN_CELL, next.cellH),
      x: Math.max(-next.cellW * 3 + 20, Math.min(containerW - 20, next.x)),
      y: Math.max(-next.cellH * 3 + 20, Math.min(containerH - 20, next.y)),
    };
    localRef.current = clamped;
    setLocal(clamped);
  }

  function commit() {
    onChange(localRef.current);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const m = modeRef.current;
    if (m.type === 'none') return;
    e.preventDefault();

    if (m.type === 'move') {
      update({
        ...localRef.current,
        x: m.ox + e.clientX - m.sx,
        y: m.oy + e.clientY - m.sy,
      });
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
        ncW = Math.max(MIN_CELL, (s.cellW * 3 - dx) / 3);
        ncH = Math.max(MIN_CELL, (s.cellH * 3 + dy) / 3);
        nx = s.x + s.cellW * 3 - ncW * 3;
      }
      update({ x: nx, y: ny, cellW: ncW, cellH: ncH });
    }
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    modeRef.current = { type: 'none' };
    commit(); // sync to parent only on release — prevents damping
  }

  function startMove(e: React.PointerEvent) {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const cur = localRef.current;
    modeRef.current = { type: 'move', sx: e.clientX, sy: e.clientY, ox: cur.x, oy: cur.y };
  }

  function startResize(corner: 'NW' | 'NE' | 'SW' | 'SE') {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      modeRef.current = { type: 'resize', corner, sx: e.clientX, sy: e.clientY, snap: { ...localRef.current } };
    };
  }

  const { x, y, cellW, cellH } = local;
  const gW = cellW * 3;
  const gH = cellH * 3;

  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= 3; i++) {
    lines.push(<line key={`v${i}`} x1={x + i * cellW} y1={y} x2={x + i * cellW} y2={y + gH} />);
    lines.push(<line key={`h${i}`} x1={x} y1={y + i * cellH} x2={x + gW} y2={y + i * cellH} />);
  }

  const corners: { id: 'NW' | 'NE' | 'SW' | 'SE'; cx: number; cy: number }[] = [
    { id: 'NW', cx: x,      cy: y },
    { id: 'NE', cx: x + gW, cy: y },
    { id: 'SW', cx: x,      cy: y + gH },
    { id: 'SE', cx: x + gW, cy: y + gH },
  ];

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: containerW, height: containerH,
        overflow: 'visible', cursor: 'default',
        touchAction: 'none', // prevent browser zoom/scroll from interfering
        userSelect: 'none',
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <g stroke="#4FC3F7" strokeWidth="1.5" opacity="0.9">{lines}</g>
      <rect x={x} y={y} width={gW} height={gH} fill="#4FC3F7" fillOpacity="0.08" />
      {/* move handle */}
      <rect
        x={x + HANDLE_R} y={y + HANDLE_R}
        width={gW - HANDLE_R * 2} height={gH - HANDLE_R * 2}
        fill="transparent" cursor="move"
        onPointerDown={startMove}
      />
      {/* resize handles */}
      {corners.map(({ id, cx, cy }) => (
        <circle
          key={id} cx={cx} cy={cy} r={HANDLE_R}
          fill="#4FC3F7" stroke="#0E1117" strokeWidth="2"
          cursor={id === 'NW' || id === 'SE' ? 'nwse-resize' : 'nesw-resize'}
          onPointerDown={startResize(id)}
        />
      ))}
      <text x={x + 4} y={y - 8} fill="#4FC3F7" fontSize="11" fontFamily="Roboto, sans-serif">
        {`${Math.round(cellW)}×${Math.round(cellH)} px/格`}
      </text>
    </svg>
  );
}
