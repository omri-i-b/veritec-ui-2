export interface IPageSize {
  width: number
  height: number
  fitScale: number
}

interface ICacheEntry {
  imageBitmap: ImageBitmap
  canvasWidth: number
  canvasHeight: number
  pageSize: IPageSize
  lastAccessed: number
}

class PageRenderCacheServiceImpl {
  private cache = new Map<string, ICacheEntry>()
  private maxSize = 200

  private makeKey(docKey: string, documentPageId: number, rotation: number): string {
    return `${docKey}:${documentPageId}:${rotation}`
  }

  async save(docKey: string, documentPageId: number, rotation: number, canvas: HTMLCanvasElement, pageSize: IPageSize): Promise<void> {
    const key = this.makeKey(docKey, documentPageId, rotation)
    const imageBitmap = await createImageBitmap(canvas)
    if (this.cache.size >= this.maxSize) this.evictOldest()
    this.cache.set(key, {
      imageBitmap,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      pageSize,
      lastAccessed: Date.now(),
    })
  }

  get(docKey: string, documentPageId: number, rotation: number): ICacheEntry | undefined {
    const key = this.makeKey(docKey, documentPageId, rotation)
    const entry = this.cache.get(key)
    if (entry) entry.lastAccessed = Date.now()
    return entry
  }

  restore(entry: ICacheEntry, canvas: HTMLCanvasElement): void {
    canvas.width = entry.canvasWidth
    canvas.height = entry.canvasHeight
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(entry.imageBitmap, 0, 0)
  }

  private evictOldest(): void {
    let oldest: { key: string; time: number } | null = null
    for (const [key, entry] of this.cache) {
      if (!oldest || entry.lastAccessed < oldest.time) {
        oldest = { key, time: entry.lastAccessed }
      }
    }
    if (oldest) {
      const entry = this.cache.get(oldest.key)
      entry?.imageBitmap.close()
      this.cache.delete(oldest.key)
    }
  }

  clear(): void {
    for (const entry of this.cache.values()) entry.imageBitmap.close()
    this.cache.clear()
  }
}

export const PageRenderCacheService = new PageRenderCacheServiceImpl()
