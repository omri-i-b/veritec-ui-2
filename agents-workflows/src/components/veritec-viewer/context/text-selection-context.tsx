import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import type { OcrDataMap, OcrPage } from "../types/ocr"
import {
  type ISelectionPoint,
  isWordInSelectionRange,
  normalizeSelectionPoints,
  sortWordsByReadingOrder,
} from "../utils/text-selection.utils"

export type { ISelectionPoint }

interface ITextSelectionState {
  isSelecting: boolean
  start: ISelectionPoint | null
  end: ISelectionPoint | null
}

interface ITextSelectionContextValue {
  selection: ITextSelectionState
  startSelection: (point: ISelectionPoint) => void
  updateSelection: (point: ISelectionPoint) => void
  endSelection: () => void
  clearSelection: () => void
  isWordSelected: (documentPageId: number, wordIndex: number) => boolean
  getOcrPage: (documentPageId: number) => OcrPage | undefined
  hasOcrUrl: (documentPageId: number) => boolean
  annotationMode: "pointer" | "rectangle"
}

const TextSelectionContext = createContext<ITextSelectionContextValue | null>(
  null,
)

export interface ITextSelectionProviderProps {
  ocrData: OcrDataMap | null | undefined
  ocrAvailablePageIds?: ReadonlySet<number>
  annotationMode?: "pointer" | "rectangle"
}

export function TextSelectionProvider({
  ocrData,
  ocrAvailablePageIds,
  annotationMode = "pointer",
  children,
}: PropsWithChildren<ITextSelectionProviderProps>) {
  const [selection, setSelection] = useState<ITextSelectionState>({
    isSelecting: false,
    start: null,
    end: null,
  })

  const ocrDataRef = useRef(ocrData)
  ocrDataRef.current = ocrData

  const ocrAvailableRef = useRef(ocrAvailablePageIds)
  ocrAvailableRef.current = ocrAvailablePageIds

  const selectionRef = useRef(selection)
  selectionRef.current = selection

  const startSelection = useCallback((point: ISelectionPoint) => {
    setSelection({ isSelecting: true, start: point, end: point })
  }, [])

  const updateSelection = useCallback((point: ISelectionPoint) => {
    setSelection((prev) =>
      !prev.isSelecting || !prev.start ? prev : { ...prev, end: point },
    )
  }, [])

  const endSelection = useCallback(() => {
    setSelection((prev) => ({ ...prev, isSelecting: false }))
  }, [])

  const clearSelection = useCallback(() => {
    setSelection({ isSelecting: false, start: null, end: null })
  }, [])

  const isWordSelected = useCallback(
    (documentPageId: number, wordIndex: number): boolean => {
      const { start, end } = selection
      if (!start || !end) return false
      return isWordInSelectionRange(documentPageId, wordIndex, start, end)
    },
    [selection],
  )

  const getOcrPage = useCallback((documentPageId: number) => {
    return ocrDataRef.current?.get(documentPageId)
  }, [])

  // Default true when no set provided — callers without per-page OCR
  // tracking keep the legacy chip-shows-while-undefined behavior.
  const hasOcrUrl = useCallback((documentPageId: number) => {
    return ocrAvailableRef.current?.has(documentPageId) ?? true
  }, [])

  const getSelectedText = useCallback((): string => {
    const { start, end } = selectionRef.current
    const ocr = ocrDataRef.current
    if (!start || !end || !ocr) return ""

    const [s, e] = normalizeSelectionPoints(start, end)
    const parts: string[] = []
    const pageIds = Array.from(ocr.keys()).sort((a, b) => a - b)

    for (const pageId of pageIds) {
      if (pageId < s.documentPageId || pageId > e.documentPageId) continue
      const page = ocr.get(pageId)
      if (!page) continue
      const sorted = sortWordsByReadingOrder(
        page.words,
        page.width,
        page.height,
      )
      const startIdx = pageId === s.documentPageId ? s.wordIndex : 0
      const endIdx =
        pageId === e.documentPageId ? e.wordIndex : sorted.length - 1
      for (let idx = startIdx; idx <= endIdx; idx++) {
        const item = sorted[idx]
        if (item) parts.push(item.word.content)
      }
      if (pageId < e.documentPageId) parts.push("\n")
    }
    return parts.join(" ")
  }, [])

  // Copy-to-clipboard handler. Hijacks only when the user is actually
  // copying the PDF selection — bail out if focus is in an editable field
  // or the native browser selection has real content.
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent): void => {
      const { start, end } = selectionRef.current
      if (!start || !end) return

      const active = document.activeElement
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return
      }

      const nativeSelection = window.getSelection()
      if (nativeSelection && nativeSelection.toString().length > 0) return

      const text = getSelectedText()
      if (text) {
        e.preventDefault()
        e.clipboardData?.setData("text/plain", text)
      }
    }
    document.addEventListener("copy", handleCopy)
    return () => document.removeEventListener("copy", handleCopy)
  }, [getSelectedText])

  // End selection on mouseup anywhere in the window.
  useEffect(() => {
    const handleMouseUp = (): void => {
      if (selectionRef.current.isSelecting) endSelection()
    }
    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [endSelection])

  const value: ITextSelectionContextValue = {
    selection,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    isWordSelected,
    getOcrPage,
    hasOcrUrl,
    annotationMode,
  }

  return (
    <TextSelectionContext.Provider value={value}>
      {children}
    </TextSelectionContext.Provider>
  )
}

/**
 * Returns the selection API. Throws if not wrapped in provider — consumers
 * who want optional behavior should use `useOptionalTextSelection` instead.
 */
export function useTextSelection(): ITextSelectionContextValue {
  const ctx = useContext(TextSelectionContext)
  if (!ctx) {
    throw new Error(
      "useTextSelection must be used within TextSelectionProvider",
    )
  }
  return ctx
}

/**
 * Like `useTextSelection`, but returns null when no provider is in the tree.
 * PdfPage uses this so standalone consumers of VeritecViewer without a
 * text-selection wrapper keep rendering the canvas only.
 */
export function useOptionalTextSelection(): ITextSelectionContextValue | null {
  return useContext(TextSelectionContext)
}
