import { useState } from 'react';
import type { RecognizedPattern } from './types';
import beadColorsData from './data/beadColors.json';
import ImageUploader from './components/ImageUploader';
import PatternEditor from './components/PatternEditor';
import RecognizedPatternView from './components/RecognizedPattern';
import ColorSummary from './components/ColorSummary';
import './App.css';

const beadColors = beadColorsData as import('./types').BeadColor[];

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

  const isSampleData = beadColors[0]?.code.startsWith('示例');

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">拼豆图纸识别器</h1>
        <p className="header__sub">上传图纸 → 校准 3×3 网格 → 自动识别每颗豆子色号</p>
      </header>

      <main className="main">
        {!imageUrl && (
          <div className="upload-section">
            <ImageUploader onImageLoaded={handleImageLoaded} />
            <p className="upload-note">
              当前色号表：<strong>{beadColors.length}</strong> 种颜色
              {isSampleData && (
                <span className="upload-note--warn">
                  （示例数据，请运行 <code>node scripts/convertColors.mjs &lt;色号表.xlsx&gt;</code> 替换为真实数据）
                </span>
              )}
            </p>
          </div>
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
          <div className="results">
            <div className="results__nav">
              <button className="btn btn--secondary" onClick={() => setPattern(null)}>← 重新校准</button>
              <button className="btn btn--secondary" onClick={handleReset}>换图片</button>
            </div>
            <RecognizedPatternView pattern={pattern} />
            <ColorSummary summary={pattern.colorSummary} />
          </div>
        )}
      </main>
    </div>
  );
}
