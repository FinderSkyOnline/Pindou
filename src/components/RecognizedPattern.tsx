import { useRef, useState } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
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
    if (row >= 0 && row < rows && col >= 0 && col < cols && cells[row]?.[col]) {
      const cell = cells[row][col];
      setTooltip({ code: cell.color.code, hex: cell.color.hex, x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 });
    } else {
      setTooltip(null);
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>识别结果</Typography>
        <Chip label={`${cols} × ${rows} 格`} size="small" variant="outlined" />
      </Box>
      <Box sx={{ overflow: 'auto', maxHeight: '55vh', borderRadius: 1, position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)`,
            width: cols * CELL_PX,
            cursor: 'crosshair',
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {cells.flat().map((cell, i) => (
            <div key={i} style={{ width: CELL_PX, height: CELL_PX, backgroundColor: cell.color.hex }} />
          ))}
        </div>
        {tooltip && (
          <Box
            sx={{
              position: 'absolute', pointerEvents: 'none',
              left: tooltip.x, top: tooltip.y,
              bgcolor: 'background.paper', border: '1px solid',
              borderColor: 'divider', borderRadius: 1,
              px: 1, py: 0.5,
              display: 'flex', alignItems: 'center', gap: 0.75,
              fontSize: 12, fontFamily: 'monospace', whiteSpace: 'nowrap', zIndex: 10,
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: tooltip.hex, border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
            {tooltip.code}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
