export interface OcrWord {
  content: string
  polygon: number[]
}

export interface OcrPage {
  pageNumber: number
  width: number
  height: number
  words: OcrWord[]
  /** Azure Document Intelligence page rotation in degrees (if provided). */
  angle?: number
}

export type OcrDataMap = Map<number, OcrPage>

export interface OcrMatch {
  documentPageId: number
  pageIndex: number
  text: string
  bbox: { left: number; top: number; width: number; height: number }
  ocrWidth: number
  ocrHeight: number
}
