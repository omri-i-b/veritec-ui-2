export interface IFitScaleOptions {
  containerWidthOffset?: number
  containerHeightOffset?: number
  minScale?: number
  maxScale?: number
  containerDimensions?: { width: number; height: number }
}

const DEFAULT_OPTIONS = {
  containerWidthOffset: 32,
  containerHeightOffset: 32,
  minScale: 0.3,
  maxScale: 6.0,
}

export function calculateBaseFitScale(
  pageWidth: number,
  pageHeight: number,
  options: IFitScaleOptions = {},
): number {
  const { containerWidthOffset, containerHeightOffset, minScale, maxScale } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }
  const baseWidth = options.containerDimensions?.width ?? window.innerWidth
  const baseHeight = options.containerDimensions?.height ?? window.innerHeight
  const containerWidth = baseWidth - containerWidthOffset
  const containerHeight = baseHeight - containerHeightOffset
  const fitScale = Math.min(containerWidth / pageWidth, containerHeight / pageHeight)
  return Math.min(maxScale, Math.max(minScale, fitScale))
}

export const DEFAULT_PAGE_DIMENSIONS = {
  WIDTH: 595,
  HEIGHT: 842,
} as const

export function getRenderScale(zoom = 1): number {
  const dpr = window.devicePixelRatio || 1
  const baseScale = 2.5 / dpr
  const zoomBoost = zoom > 1 ? Math.sqrt(zoom) : 1
  const scale = baseScale * zoomBoost
  const maxScale = 4.0 / dpr
  return Math.max(1.0, Math.min(scale, maxScale))
}
