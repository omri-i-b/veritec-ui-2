import { Fragment, memo, useCallback, useMemo, useRef } from "react"
import { useTextSelection } from "../context/text-selection-context"
import type { OcrPage } from "../types/ocr"
import {
  type RotationValue,
  transformBoundingBoxForRotation,
} from "../utils/coordinates.utils"
import {
  CLOSEST_WORD_THRESHOLD_PCT,
  getPolygonBounds,
  LINE_THRESHOLD_PCT,
} from "../utils/text-selection.utils"

interface IOcrTextLayerProps {
  ocrPage: OcrPage
  documentPageId: number
  visualWidth: number
  visualHeight: number
  rotation?: RotationValue
}

interface IWordPosition {
  leftPct: number
  topPct: number
  widthPct: number
  heightPct: number
  rawLeftPct: number
  rawTopPct: number
  originalIndex: number
  sortedIndex: number
}

/**
 * Transparent text layer overlaid on a PDF canvas. Uses OCR word polygons
 * to hit-test mouse events for text selection (custom implementation —
 * native selection is disabled via `userSelect: none`). Copy is wired at
 * the provider level via a document-wide `copy` handler.
 */
export const OcrTextLayer = memo(function OcrTextLayer({
  ocrPage,
  documentPageId,
  visualWidth,
  visualHeight,
  rotation = 0,
}: IOcrTextLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    selection,
    startSelection,
    updateSelection,
    clearSelection,
    isWordSelected,
    annotationMode,
  } = useTextSelection()
  const isDrawingMode = annotationMode === "rectangle"

  // OCR orientation: prefer the explicit page angle from Azure Document
  // Intelligence when present — the aspect-ratio fallback misclassifies
  // near-square pages (receipts, half-letter scans).
  let ocrBaseRotation: RotationValue = 0
  if (typeof ocrPage.angle === "number") {
    const snapped =
      ((Math.round(ocrPage.angle / 90) * 90) % 360 + 360) % 360
    ocrBaseRotation = snapped as RotationValue
  } else {
    const ocrIsLandscape = ocrPage.width > ocrPage.height
    const isUserRotated90or270 = rotation === 90 || rotation === 270
    const originalPageIsLandscape = isUserRotated90or270
      ? visualHeight > visualWidth
      : visualWidth > visualHeight
    if (ocrIsLandscape !== originalPageIsLandscape) ocrBaseRotation = 90
  }
  const totalRotation = ((ocrBaseRotation + rotation) % 360) as RotationValue

  const wordPositions = useMemo((): IWordPosition[] => {
    const positions = ocrPage.words.map((word, originalIndex) => {
      const { minX, maxX, minY, maxY } = getPolygonBounds(word.polygon)

      const rawLeftPct = (minX / ocrPage.width) * 100
      const rawTopPct = (minY / ocrPage.height) * 100
      const rawWidthPct = ((maxX - minX) / ocrPage.width) * 100
      const rawHeightPct = ((maxY - minY) / ocrPage.height) * 100

      const transformed = transformBoundingBoxForRotation(
        {
          left: rawLeftPct,
          top: rawTopPct,
          width: rawWidthPct,
          height: rawHeightPct,
        },
        100,
        100,
        totalRotation,
      )

      return {
        leftPct: transformed.left,
        topPct: transformed.top,
        widthPct: transformed.width,
        heightPct: transformed.height,
        rawLeftPct,
        rawTopPct,
        originalIndex,
        sortedIndex: 0,
      }
    })

    const sortedIndices = [...positions]
      .map((pos, idx) => ({ pos, idx }))
      .sort((a, b) => {
        if (Math.abs(a.pos.rawTopPct - b.pos.rawTopPct) > LINE_THRESHOLD_PCT) {
          return a.pos.rawTopPct - b.pos.rawTopPct
        }
        return a.pos.rawLeftPct - b.pos.rawLeftPct
      })

    sortedIndices.forEach((item, sortedIdx) => {
      positions[item.idx].sortedIndex = sortedIdx
    })

    return positions
  }, [ocrPage, totalRotation])

  const wordPositionsRef = useRef(wordPositions)
  wordPositionsRef.current = wordPositions

  const findWordAtPosition = useCallback(
    (clientX: number, clientY: number): number | null => {
      const container = containerRef.current
      if (!container) return null

      const positions = wordPositionsRef.current
      const rect = container.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const xPct = (x / rect.width) * 100
      const yPct = (y / rect.height) * 100

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i]
        if (
          xPct >= pos.leftPct &&
          xPct <= pos.leftPct + pos.widthPct &&
          yPct >= pos.topPct &&
          yPct <= pos.topPct + pos.heightPct
        ) {
          return i
        }
      }

      let closestIdx = -1
      let closestDist = Infinity
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i]
        const centerX = pos.leftPct + pos.widthPct / 2
        const centerY = pos.topPct + pos.heightPct / 2
        const dist = Math.sqrt((xPct - centerX) ** 2 + (yPct - centerY) ** 2)
        if (dist < closestDist && dist < CLOSEST_WORD_THRESHOLD_PCT) {
          closestDist = dist
          closestIdx = i
        }
      }

      return closestIdx >= 0 ? closestIdx : null
    },
    [],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      window.getSelection()?.removeAllRanges()

      const wordIdx = findWordAtPosition(e.clientX, e.clientY)
      if (wordIdx !== null) {
        const sortedIdx = wordPositionsRef.current[wordIdx].sortedIndex
        startSelection({ documentPageId, wordIndex: sortedIdx })
      } else {
        clearSelection()
      }
    },
    [documentPageId, findWordAtPosition, startSelection, clearSelection],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selection.isSelecting) return
      const wordIdx = findWordAtPosition(e.clientX, e.clientY)
      if (wordIdx !== null) {
        const sortedIdx = wordPositionsRef.current[wordIdx].sortedIndex
        updateSelection({ documentPageId, wordIndex: sortedIdx })
      }
    },
    [
      selection.isSelecting,
      documentPageId,
      findWordAtPosition,
      updateSelection,
    ],
  )

  return (
    <div
      ref={containerRef}
      className="textLayer"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        cursor: isDrawingMode ? "crosshair" : "text",
        userSelect: "none",
        pointerEvents: isDrawingMode ? "none" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      {ocrPage.words.map((word, idx) => {
        const pos = wordPositions[idx]
        const heightPx = (pos.heightPct / 100) * visualHeight
        const selected = isWordSelected(documentPageId, pos.sortedIndex)

        return (
          <Fragment key={idx}>
            {selected && (
              <div
                style={{
                  position: "absolute",
                  left: `${pos.leftPct}%`,
                  top: `${pos.topPct}%`,
                  width: `${pos.widthPct}%`,
                  height: `${pos.heightPct}%`,
                  backgroundColor: "rgba(0, 100, 255, 0.3)",
                  pointerEvents: "none",
                  zIndex: 11,
                }}
              />
            )}
            <span
              style={{
                position: "absolute",
                left: `${pos.leftPct}%`,
                top: `${pos.topPct}%`,
                width: `${pos.widthPct}%`,
                height: `${pos.heightPct}%`,
                fontSize: `${heightPx * 0.85}px`,
                lineHeight: 1,
                color: "transparent",
                whiteSpace: "pre",
                pointerEvents: "none",
              }}
            >
              {word.content}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
})
