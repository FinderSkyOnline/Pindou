import { Box, Paper, Typography, Chip, LinearProgress, Stack } from '@mui/material';
import type { ColorUsage } from '../types';

interface Props {
  summary: ColorUsage[];
}

export default function ColorSummary({ summary }: Props) {
  const total = summary.reduce((s, c) => s + c.count, 0);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>用色统计</Typography>
        <Chip label={`${summary.length} 种 · ${total} 颗`} size="small" variant="outlined" />
      </Box>
      <Stack spacing={1} sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {summary.map(({ color, count }) => (
          <Box key={color.code} sx={{ display: 'grid', gridTemplateColumns: '20px 80px 64px 1fr', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: color.hex, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
              {color.code}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
              {count} 颗
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(count / total) * 100}
              sx={{ height: 6, '& .MuiLinearProgress-bar': { bgcolor: color.hex } }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
