interface IQueueItem {
  id: string
  priority: number
  task: () => Promise<void>
  resolve: () => void
  reject: (err: unknown) => void
}

class RenderQueueImpl {
  private queue: IQueueItem[] = []
  private queueIds = new Map<string, number>()
  private running = 0
  private readonly concurrency: number

  constructor(concurrency: number) {
    this.concurrency = concurrency
  }

  enqueue(id: string, priority: number, task: () => Promise<void>): Promise<void> {
    const existingIdx = this.queueIds.get(id)
    if (existingIdx !== undefined) {
      const existing = this.queue[existingIdx]
      this.queue.splice(existingIdx, 1)
      this.rebuildIndex()
      existing.resolve()
    }
    return new Promise<void>((resolve, reject) => {
      const item: IQueueItem = { id, priority, task, resolve, reject }
      let insertIdx = this.queue.length
      for (let i = this.queue.length - 1; i >= 0; i--) {
        if (this.queue[i].priority <= priority) {
          insertIdx = i + 1
          break
        }
        insertIdx = i
      }
      this.queue.splice(insertIdx, 0, item)
      this.rebuildIndex()
      this.flush()
    })
  }

  cancel(id: string): void {
    const idx = this.queueIds.get(id)
    if (idx !== undefined) {
      const item = this.queue[idx]
      this.queue.splice(idx, 1)
      this.rebuildIndex()
      item.resolve()
    }
  }

  private rebuildIndex(): void {
    this.queueIds.clear()
    for (let i = 0; i < this.queue.length; i++) {
      this.queueIds.set(this.queue[i].id, i)
    }
  }

  private flush(): void {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift()!
      this.rebuildIndex()
      this.running++
      item
        .task()
        .then(() => item.resolve())
        .catch((err) => item.reject(err))
        .finally(() => {
          this.running--
          this.flush()
        })
    }
  }
}

export const pdfRenderQueue = new RenderQueueImpl(3)
