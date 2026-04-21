export interface BeadColor {
  code: string;
  r: number;
  g: number;
  b: number;
  hex: string;
}

export interface CalibrationState {
  x: number;
  y: number;
  cellW: number;
  cellH: number;
}

export interface PatternCell {
  col: number;
  row: number;
  color: BeadColor;
}

export interface RecognizedPattern {
  cols: number;
  rows: number;
  cells: PatternCell[][];
  colorSummary: ColorUsage[];
}

export interface ColorUsage {
  color: BeadColor;
  count: number;
}

export interface ImageScale {
  scaleX: number;
  scaleY: number;
  naturalWidth: number;
  naturalHeight: number;
}
