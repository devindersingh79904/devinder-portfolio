import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Surface the error for debugging; avoid crashing the whole app.
    console.error('Unhandled UI error:', error)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4 p-8">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
