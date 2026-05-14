export type RotationValue = 0 | 90 | 180 | 270

export interface IBoundingBox {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Transforms a bounding box from original PDF coordinates to rotated
 * coordinates. Mirrors dev's `transformBoundingBoxForRotation`.
 *
 * When a page is rotated:
 * - 90° CW:  (x, y) -> (pdfHeight - y - height, x), width <-> height
 * - 180°:    (x, y) -> (pdfWidth - x - width, pdfHeight - y - height)
 * - 270° CW: (x, y) -> (y, pdfWidth - x - width), width <-> height
 */
export function transformBoundingBoxForRotation(
  box: IBoundingBox,
  pdfWidth: number,
  pdfHeight: number,
  rotation: RotationValue,
): IBoundingBox {
  switch (rotation) {
    case 0:
      return box
    case 90:
      return {
        left: pdfHeight - box.top - box.height,
        top: box.left,
        width: box.height,
        height: box.width,
      }
    case 180:
      return {
        left: pdfWidth - box.left - box.width,
        top: pdfHeight - box.top - box.height,
        width: box.width,
        height: box.height,
      }
    case 270:
      return {
        left: box.top,
        top: pdfWidth - box.left - box.width,
        width: box.height,
        height: box.width,
      }
    default:
      return box
  }
}
