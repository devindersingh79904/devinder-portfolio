import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 p-8">
      <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
      <p className="text-lg text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button asChild>
        <Link to={ROUTES.HOME}>Back to Home</Link>
      </Button>
    </div>
  )
}
