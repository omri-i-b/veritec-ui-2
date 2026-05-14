import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / serialization errors */
  }
}

/**
 * useState backed by localStorage. Re-keys when `key` changes — useful
 * when the same component represents different entities (e.g. a widget
 * keyed by its id), so each entity keeps its own value without leaking
 * across.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readFromStorage(key, initial))
  const lastKeyRef = useRef(key)

  // When the key changes, reload from the new key's storage slot.
  useEffect(() => {
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key
    setValue(readFromStorage(key, initial))
    // initial intentionally omitted — only re-read when key changes.
    // biome-ignore lint/correctness/useExhaustiveDependencies: see comment
  }, [key])

  const setAndPersist = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next
        writeToStorage(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, setAndPersist]
}
