import type { IPluginContext, IViewerPlugin } from "./types"

export type RotationValue = 0 | 90 | 180 | 270

export interface IPageRotation {
  documentPageId: number
  rotation: RotationValue
}

export interface IRotationChangeEvent {
  documentPageId: number
  oldRotation: RotationValue
  newRotation: RotationValue
}

export interface IRotationPluginOptions {
  initialRotations?: Map<number, RotationValue>
  onChange?: (event: IRotationChangeEvent) => void
}

export interface IRotationPlugin extends IViewerPlugin {
  setRotation: (documentPageId: number, rotation: RotationValue) => void
  getRotation: (documentPageId: number) => RotationValue
  rotateClockwise: (documentPageId: number) => void
  rotateCounterClockwise: (documentPageId: number) => void
  setRotations: (rotations: IPageRotation[]) => void
  getAllRotations: () => Map<number, RotationValue>
}

const ROTATION_VALUES: RotationValue[] = [0, 90, 180, 270]

export function createRotationPlugin(
  options: IRotationPluginOptions = {},
): IRotationPlugin {
  const { initialRotations = new Map(), onChange } = options

  let ctx: IPluginContext | null = null
  const rotations = new Map<number, RotationValue>(initialRotations)

  const syncStateToContext = (): void => {
    // Always sync so that clearing all rotations propagates an empty
    // Map; PDF renderer's useRotations() selector tolerates empty.
    ctx?.setState("rotations", new Map(rotations))
  }

  const notifyChange = (
    documentPageId: number,
    oldRotation: RotationValue,
    newRotation: RotationValue,
  ): void => {
    syncStateToContext()
    onChange?.({ documentPageId, oldRotation, newRotation })
  }

  return {
    name: "rotation",

    onMount(context: IPluginContext) {
      ctx = context
      if (rotations.size > 0) syncStateToContext()
      return () => {
        ctx = null
      }
    },

    setRotation(documentPageId, rotation) {
      const oldRotation = rotations.get(documentPageId) ?? 0
      if (oldRotation !== rotation) {
        rotations.set(documentPageId, rotation)
        notifyChange(documentPageId, oldRotation, rotation)
      }
    },

    getRotation(documentPageId) {
      return rotations.get(documentPageId) ?? 0
    },

    rotateClockwise(documentPageId) {
      const current = rotations.get(documentPageId) ?? 0
      const currentIndex = ROTATION_VALUES.indexOf(current)
      const newIndex = (currentIndex + 1) % ROTATION_VALUES.length
      const newRotation = ROTATION_VALUES[newIndex]
      rotations.set(documentPageId, newRotation)
      notifyChange(documentPageId, current, newRotation)
    },

    rotateCounterClockwise(documentPageId) {
      const current = rotations.get(documentPageId) ?? 0
      const currentIndex = ROTATION_VALUES.indexOf(current)
      const newIndex =
        (currentIndex - 1 + ROTATION_VALUES.length) % ROTATION_VALUES.length
      const newRotation = ROTATION_VALUES[newIndex]
      rotations.set(documentPageId, newRotation)
      notifyChange(documentPageId, current, newRotation)
    },

    setRotations(pageRotations) {
      rotations.clear()
      for (const { documentPageId, rotation } of pageRotations) {
        rotations.set(documentPageId, rotation)
      }
      syncStateToContext()
    },

    getAllRotations() {
      return new Map(rotations)
    },
  }
}
