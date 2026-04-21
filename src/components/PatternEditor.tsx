import { useRef, useState, useEffect } from 'react';
import { Box, Paper, Button, Typography, Alert, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      setContainerSize({ w: el.offsetWidth, h: el.offsetHeight });
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
    setCalibration({
      x: Math.round(w / 2 - INITIAL_CELL * 1.5),
      y: Math.round(h / 2 - INITIAL_CELL * 1.5),
      cellW: INITIAL_CELL,
      cellH: INITIAL_CELL,
    });
  }

  async function handleRecognize() {
    const img = imgRef.current;
    if (!img || beadColors.length === 0) return;
    setRunning(true);
    setWarning('');

    const scale = getImageScale(img);
    const { cols, rows, cells } = computeFullGrid(calibration, scale);

    if (cols * rows > 250000) setWarning(`网格过大（${cols}×${rows}），已自动限制为 500×500`);

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
    <Stack spacing={2}>
      {/* image + grid overlay */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          display: 'inline-block',
          lineHeight: 0,
          alignSelf: 'flex-start',
          borderRadius: 3,
          overflow: 'visible',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          maxHeight: '65vh',
          touchAction: 'none', // prevent page zoom over image area
        }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="bead pattern"
          onLoad={onImageLoad}
          draggable={false}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '65vh',
            objectFit: 'contain',
            borderRadius: 12,
            userSelect: 'none',
          }}
        />
        {containerSize.w > 0 && (
          <CalibrationGrid
            calibration={calibration}
            onChange={setCalibration}
            containerW={containerSize.w}
            containerH={containerSize.h}
          />
        )}
      </Box>

      {/* toolbar */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.7 }}>
          <strong style={{ color: '#fff' }}>校准方法：</strong>
          拖动网格到图纸上，拖四角调整大小，使 3×3 格子恰好覆盖 3×3 颗豆子
        </Typography>
        {warning && <Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2 }}>{warning}</Alert>}
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onReset} size="small">
            换图片
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleRecognize}
            disabled={running}
            size="small"
          >
            {running ? '识别中…' : '确认校准并识别'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
