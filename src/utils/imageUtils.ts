import type { CalibrationState, ImageScale } from '../types';

export function getImageScale(img: HTMLImageElement): ImageScale {
  return {
    scaleX: img.naturalWidth / img.offsetWidth,
    scaleY: img.naturalHeight / img.offsetHeight,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
  };
}

export function sampleCellColor(
  ctx: CanvasRenderingContext2D,
  natX: number,
  natY: number,
  natW: number,
  natH: number,
): { r: number; g: number; b: number } {
  // Sample center 50% to avoid dark bead-border seams
  const sampleW = Math.max(1, Math.round(natW * 0.5));
  const sampleH = Math.max(1, Math.round(natH * 0.5));
  const sampleX = Math.round(natX + (natW - sampleW) / 2);
  const sampleY = Math.round(natY + (natH - sampleH) / 2);

  const { data } = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
  let rSum = 0, gSum = 0, bSum = 0;
  const pixelCount = sampleW * sampleH;
  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
  }
  return {
    r: Math.round(rSum / pixelCount),
    g: Math.round(gSum / pixelCount),
    b: Math.round(bSum / pixelCount),
  };
}

export interface GridCell {
  col: number;
  row: number;
  natX: number;
  natY: number;
  natW: number;
  natH: number;
}

export function computeFullGrid(
  calibration: CalibrationState,
  scale: ImageScale,
): { cols: number; rows: number; cells: GridCell[] } {
  const natCellW = calibration.cellW * scale.scaleX;
  const natCellH = calibration.cellH * scale.scaleY;
  const natOriginX = calibration.x * scale.scaleX;
  const natOriginY = calibration.y * scale.scaleY;

  // Extend grid backward to image top-left edge
  const colsLeft = Math.floor(natOriginX / natCellW);
  const rowsAbove = Math.floor(natOriginY / natCellH);
  const gridStartX = natOriginX - colsLeft * natCellW;
  const gridStartY = natOriginY - rowsAbove * natCellH;

  const cols = Math.min(500, Math.floor((scale.naturalWidth - gridStartX) / natCellW));
  const rows = Math.min(500, Math.floor((scale.naturalHeight - gridStartY) / natCellH));

  const cells: GridCell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        col, row,
        natX: gridStartX + col * natCellW,
        natY: gridStartY + row * natCellH,
        natW: natCellW,
        natH: natCellH,
      });
    }
  }
  return { cols, rows, cells };
}
