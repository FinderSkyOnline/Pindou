import { useRef, useState, useEffect } from 'react';
import type { BeadColor, CalibrationState, RecognizedPattern, PatternCell, ColorUsage } from '../types';
import { getImageScale, sampleCellColor, computeFullGrid } from '../utils/imageUtils';
import { buildMatcher } from '../utils/colorMatcher';
import CalibrationGrid from './CalibrationGrid';

interface Props {
  imageUrl: string;
  beadColors: BeadColor[];
  onPatternRecognized: (pattern: RecognizedPattern) => void;
  onReset: () => void;
}

const INITIAL_CELL = 30;

export default function PatternEditor({ imageUrl, beadColors, onPatternRecognized, onReset }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [calibration, setCalibration] = useState<CalibrationState>({ x: 0, y: 0, cellW: INITIAL_CELL, cellH: INITIAL_CELL });
  const [running, setRunning] = useState(false);
  const [warning, setWarning] = useState('');

  // Measure container size and set initial grid position
  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setContainerSize({ w, h });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [imageUrl]);

  function onImageLoad() {
    const el = containerRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setContainerSize({ w, h });
    // Place grid in image center
    const cw = INITIAL_CELL;
    const ch = INITIAL_CELL;
    setCalibration({
      x: Math.round(w / 2 - cw * 1.5),
      y: Math.round(h / 2 - ch * 1.5),
      cellW: cw,
      cellH: ch,
    });
  }

  async function handleRecognize() {
    const img = imgRef.current;
    if (!img || beadColors.length === 0) return;
    setRunning(true);
    setWarning('');

    // Use fresh scale at confirmation time
    const scale = getImageScale(img);
    const { cols, rows, cells } = computeFullGrid(calibration, scale);

    if (cols * rows > 250000) {
      setWarning(`网格过大（${cols}×${rows}），已自动限制为 500×500`);
    }

    const canvas = document.createElement('canvas');
    canvas.width = scale.naturalWidth;
    canvas.height = scale.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const findNearest = buildMatcher(beadColors);
    const grid: PatternCell[][] = Array.from({ length: rows }, () => new Array(cols));
    const usageMap = new Map<string, ColorUsage>();

    for (const cell of cells) {
      const { r, g, b } = sampleCellColor(ctx, cell.natX, cell.natY, cell.natW, cell.natH);
      const matched = findNearest(r, g, b);
      grid[cell.row][cell.col] = { col: cell.col, row: cell.row, color: matched };

      const prev = usageMap.get(matched.code);
      if (prev) prev.count++;
      else usageMap.set(matched.code, { color: matched, count: 1 });
    }

    const colorSummary = Array.from(usageMap.values()).sort((a, b) => b.count - a.count);
    onPatternRecognized({ cols, rows, cells: grid, colorSummary });
    setRunning(false);
  }

  return (
    <div className="editor">
      <div className="editor__canvas-wrap" ref={containerRef}>
        <img
          ref={imgRef}
          src={imageUrl}
          alt="bead pattern"
          className="editor__img"
          onLoad={onImageLoad}
          draggable={false}
        />
        {containerSize.w > 0 && (
          <CalibrationGrid
            calibration={calibration}
            onChange={setCalibration}
            containerW={containerSize.w}
            containerH={containerSize.h}
          />
        )}
      </div>

      <div className="editor__toolbar">
        <div className="editor__hint">
          <strong>校准方法：</strong>拖动网格到图纸上，调整四角手柄使 3×3 格子恰好覆盖 3×3 颗豆子
        </div>
        {warning && <div className="editor__warning">{warning}</div>}
        <div className="editor__actions">
          <button className="btn btn--secondary" onClick={onReset}>换图片</button>
          <button className="btn btn--primary" onClick={handleRecognize} disabled={running}>
            {running ? '识别中…' : '确认校准并识别'}
          </button>
        </div>
      </div>
    </div>
  );
}
