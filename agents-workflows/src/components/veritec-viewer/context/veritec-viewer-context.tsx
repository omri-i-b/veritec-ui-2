import React, { createContext, useContext, useReducer, useMemo, useCallback, useRef } from "react"
import { detectMediaType } from "../renderers"
import type {
  IViewerDocument,
  IViewerContextState,
  IViewerContextActions,
  IDocumentState,
  PluginStateKey,
  IPluginState,
} from "../veritec-viewer.types"

type Action =
  | { type: "SET_PROGRESS"; viewerPageId: string; progress: number }
  | { type: "SET_LOADED"; viewerPageId: string; numPages?: number }
  | { type: "SET_ERROR"; viewerPageId: string; error: string }
  | { type: "SET_VISIBLE_PAGE"; viewerPageId: string; page: number }
  | { type: "SET_PLUGIN_STATE"; key: PluginStateKey; value: IPluginState[PluginStateKey] }

function reducer(state: IViewerContextState, action: Action): IViewerContextState {
  switch (action.type) {
    case "SET_PROGRESS": {
      const docStates = new Map(state.documentStates)
      const current = docStates.get(action.viewerPageId)
      if (current) {
        docStates.set(action.viewerPageId, { ...current, progress: action.progress, loadState: "loading" })
      }
      return { ...state, documentStates: docStates }
    }
    case "SET_LOADED": {
      const docStates = new Map(state.documentStates)
      const current = docStates.get(action.viewerPageId)
      if (current) {
        docStates.set(action.viewerPageId, { ...current, loadState: "loaded", progress: 100, numPages: action.numPages })
      }
      return { ...state, documentStates: docStates }
    }
    case "SET_ERROR": {
      const docStates = new Map(state.documentStates)
      const current = docStates.get(action.viewerPageId)
      if (current) {
        docStates.set(action.viewerPageId, { ...current, loadState: "error", error: action.error })
      }
      return { ...state, documentStates: docStates }
    }
    case "SET_VISIBLE_PAGE":
      return { ...state, currentVisibleDocument: action.viewerPageId, currentVisiblePage: action.page }
    case "SET_PLUGIN_STATE":
      return { ...state, pluginState: { ...state.pluginState, [action.key]: action.value } }
    default:
      return state
  }
}

const ViewerStateContext = createContext<IViewerContextState | null>(null)
const ViewerActionsContext = createContext<IViewerContextActions | null>(null)

interface IVeritecViewerProviderProps {
  documents: IViewerDocument[]
  children: React.ReactNode
}

export const VeritecViewerProvider: React.FC<IVeritecViewerProviderProps> = ({ documents, children }) => {
  const initialState: IViewerContextState = useMemo(
    () => ({
      documents,
      documentStates: new Map(
        documents.map((doc) => [
          doc.viewerPageId,
          { viewerPageId: doc.viewerPageId, mediaType: detectMediaType(doc.url), loadState: "pending", progress: 0 } as IDocumentState,
        ]),
      ),
      currentVisibleDocument: documents[0]?.viewerPageId || null,
      currentVisiblePage: 1,
      pluginState: {},
    }),
    [documents],
  )

  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  const setPluginState = useCallback(
    <K extends PluginStateKey>(key: K, value: IPluginState[K]): void => {
      dispatch({ type: "SET_PLUGIN_STATE", key, value })
    },
    [],
  )

  const getPluginState = useCallback(
    <K extends PluginStateKey>(key: K): IPluginState[K] | undefined => {
      return stateRef.current.pluginState[key]
    },
    [],
  )

  const actions: IViewerContextActions = useMemo(
    () => ({
      setDocumentProgress: (viewerPageId: string, progress: number): void =>
        dispatch({ type: "SET_PROGRESS", viewerPageId, progress }),
      setDocumentLoaded: (viewerPageId: string, numPages?: number): void =>
        dispatch({ type: "SET_LOADED", viewerPageId, numPages }),
      setDocumentError: (viewerPageId: string, error: string): void =>
        dispatch({ type: "SET_ERROR", viewerPageId, error }),
      setVisiblePage: (viewerPageId: string, page: number): void =>
        dispatch({ type: "SET_VISIBLE_PAGE", viewerPageId, page }),
      setPluginState,
      getPluginState,
    }),
    [setPluginState, getPluginState],
  )

  return (
    <ViewerActionsContext.Provider value={actions}>
      <ViewerStateContext.Provider value={state}>{children}</ViewerStateContext.Provider>
    </ViewerActionsContext.Provider>
  )
}

export function useViewerState(): IViewerContextState {
  const context = useContext(ViewerStateContext)
  if (!context) throw new Error("useViewerState must be used within VeritecViewerProvider")
  return context
}

export function useViewerActions(): IViewerContextActions {
  const context = useContext(ViewerActionsContext)
  if (!context) throw new Error("useViewerActions must be used within VeritecViewerProvider")
  return context
}

export {
  useZoom,
  useCurrentPage,
  useDocumentState,
  useRotations,
  useContainerDimensionsSelector,
} from "../hooks/use-viewer-selectors"
