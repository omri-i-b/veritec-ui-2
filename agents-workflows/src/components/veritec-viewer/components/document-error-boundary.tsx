import { Component, type ErrorInfo, type ReactNode } from "react"
import { WarningCircle } from "@phosphor-icons/react"

interface IDocumentErrorBoundaryProps {
  children: ReactNode
  documentId?: string
}

interface IDocumentErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class DocumentErrorBoundary extends Component<
  IDocumentErrorBoundaryProps,
  IDocumentErrorBoundaryState
> {
  constructor(props: IDocumentErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): IDocumentErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Document rendering error:", error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-md bg-muted p-4">
          <WarningCircle className="mb-2 size-12 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Failed to load document</h3>
          <p className="mb-2 text-center text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
