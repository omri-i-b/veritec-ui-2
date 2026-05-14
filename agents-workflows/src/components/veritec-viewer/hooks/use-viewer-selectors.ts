import { useViewerState } from "../context/veritec-viewer-context"
import type { IPageInfo, IDocumentState, IContainerDimensions } from "../veritec-viewer.types"

const EMPTY_ROTATIONS_MAP = new Map<number, 0 | 90 | 180 | 270>()

export function useZoom(): number {
  const { pluginState } = useViewerState()
  return pluginState.zoom ?? 1
}

export function useCurrentPage(): IPageInfo | null {
  const { pluginState } = useViewerState()
  return pluginState.currentPage ?? null
}

export function useDocumentState(viewerPageId: string): IDocumentState | undefined {
  const { documentStates } = useViewerState()
  return documentStates.get(viewerPageId)
}

export function useRotations(): Map<number, 0 | 90 | 180 | 270> {
  const { pluginState } = useViewerState()
  return pluginState.rotations ?? EMPTY_ROTATIONS_MAP
}

export function useContainerDimensionsSelector(): IContainerDimensions | null {
  const { pluginState } = useViewerState()
  return pluginState.containerDimensions ?? null
}
