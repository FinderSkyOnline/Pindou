import { useState } from 'react';
import { Box, Container, Typography, Button, Stack, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { RecognizedPattern } from './types';
import beadColorsData from './data/beadColors.json';
import ImageUploader from './components/ImageUploader';
import PatternEditor from './components/PatternEditor';
import RecognizedPatternView from './components/RecognizedPattern';
import ColorSummary from './components/ColorSummary';
import './App.css';

const beadColors = beadColorsData as import('./types').BeadColor[];
const isSampleData = beadColors[0]?.code.startsWith('示例');

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pattern, setPattern] = useState<RecognizedPattern | null>(null);

  function handleImageLoaded(url: string) {
    setImageUrl(url);
    setPattern(null);
  }

  function handleReset() {
    setImageUrl(null);
    setPattern(null);
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box component="header" sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2, px: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
          拼豆图纸识别器
        </Typography>
        <Typography variant="caption" color="text.secondary">
          上传图纸 → 校准 3×3 网格 → 自动识别每颗豆子色号
        </Typography>
      </Box>

      {/* Main */}
      <Container maxWidth="md" sx={{ flex: 1, py: 3, px: 2 }}>
        {!imageUrl && (
          <Stack sx={{ alignItems: 'center', pt: 4 }} spacing={2}>
            <ImageUploader onImageLoaded={handleImageLoaded} />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              当前色号表：<strong>{beadColors.length}</strong> 种颜色
            </Typography>
            {isSampleData && (
              <Alert severity="warning" sx={{ borderRadius: 3, maxWidth: 440, width: '100%' }}>
                当前为示例数据，请运行&nbsp;
                <code>node scripts/convertColors.mjs &lt;色号表.xlsx&gt;</code>&nbsp;
                替换为真实数据
              </Alert>
            )}
          </Stack>
        )}

        {imageUrl && !pattern && (
          <PatternEditor
            imageUrl={imageUrl}
            beadColors={beadColors}
            onPatternRecognized={setPattern}
            onReset={handleReset}
          />
        )}

        {pattern && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => setPattern(null)}>
                重新校准
              </Button>
              <Button variant="outlined" size="small" onClick={handleReset}>
                换图片
              </Button>
            </Stack>
            <RecognizedPatternView pattern={pattern} />
            <ColorSummary summary={pattern.colorSummary} />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
