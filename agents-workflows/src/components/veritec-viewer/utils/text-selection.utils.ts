import type { OcrWord } from "../types/ocr"

/** Threshold for determining if words are on the same line (% of page height). */
export const LINE_THRESHOLD_PCT = 1.5

/** Max distance to snap selection to nearest word when not over one (%). */
export const CLOSEST_WORD_THRESHOLD_PCT = 5

export interface IPolygonBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface ISelectionPoint {
  documentPageId: number
  wordIndex: number
}

export interface ISortedWord {
  word: OcrWord
  originalIndex: number
  leftPct: number
  topPct: number
}

/**
 * Extract bounding box from an OCR polygon of 8 coordinates
 * (x1,y1,x2,y2,x3,y3,x4,y4). Azure Document Intelligence layout.
 */
export function getPolygonBounds(polygon: number[]): IPolygonBounds {
  const xs = [polygon[0], polygon[2], polygon[4], polygon[6]]
  const ys = [polygon[1], polygon[3], polygon[5], polygon[7]]
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

/**
 * Sort words by visual reading order (top-to-bottom, left-to-right).
 * Words within `LINE_THRESHOLD_PCT` of each other vertically are treated
 * as same-line and sorted by X.
 */
export function sortWordsByReadingOrder(
  words: OcrWord[],
  pageWidth: number,
  pageHeight: number,
): ISortedWord[] {
  return words
    .map((word, originalIndex) => {
      const bounds = getPolygonBounds(word.polygon)
      return {
        word,
        originalIndex,
        leftPct: (bounds.minX / pageWidth) * 100,
        topPct: (bounds.minY / pageHeight) * 100,
      }
    })
    .sort((a, b) => {
      if (Math.abs(a.topPct - b.topPct) > LINE_THRESHOLD_PCT) {
        return a.topPct - b.topPct
      }
      return a.leftPct - b.leftPct
    })
}

/**
 * Order selection points so `start` precedes `end` in document order
 * (lower page first, then lower word index within page).
 */
export function normalizeSelectionPoints(
  start: ISelectionPoint,
  end: ISelectionPoint,
): [ISelectionPoint, ISelectionPoint] {
  if (start.documentPageId < end.documentPageId) return [start, end]
  if (start.documentPageId > end.documentPageId) return [end, start]
  return start.wordIndex <= end.wordIndex ? [start, end] : [end, start]
}

export function isWordInSelectionRange(
  wordPageId: number,
  wordIndex: number,
  start: ISelectionPoint,
  end: ISelectionPoint,
): boolean {
  const [s, e] = normalizeSelectionPoints(start, end)
  if (wordPageId < s.documentPageId || wordPageId > e.documentPageId)
    return false
  if (wordPageId === s.documentPageId && wordIndex < s.wordIndex) return false
  if (wordPageId === e.documentPageId && wordIndex > e.wordIndex) return false
  return true
}
