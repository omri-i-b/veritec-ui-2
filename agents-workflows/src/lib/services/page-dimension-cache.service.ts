class PageDimensionCacheImpl {
  private cache = new Map<string, { width: number; height: number }>()

  private makeKey(docKey: string, documentPageId: number): string {
    return `${docKey}:${documentPageId}`
  }

  get(
    docKey: string,
    documentPageId: number,
  ): { width: number; height: number } | undefined {
    return this.cache.get(this.makeKey(docKey, documentPageId))
  }

  set(
    docKey: string,
    documentPageId: number,
    size: { width: number; height: number },
  ): void {
    this.cache.set(this.makeKey(docKey, documentPageId), size)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const PageDimensionCache = new PageDimensionCacheImpl()
