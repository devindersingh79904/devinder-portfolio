import { Button } from '@/components/ui/button'

interface LoadErrorProps {
  message?: string
  onRetry?: () => void
}

// Friendly fallback for failed data fetches (e.g. API down), with a retry action.
export function LoadError({ message = 'Something went wrong loading this content.', onRetry }: LoadErrorProps) {
  return (
    <div className="container mx-auto p-8 text-center space-y-4">
      <p className="text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>Retry</Button>
      )}
    </div>
  )
}
