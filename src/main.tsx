import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

async function bootstrap() {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        const { worker } = await import('@/mocks/browser')
        await worker.start({ onUnhandledFrame: 'bypass' })
    }
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </StrictMode>,
    )
}

void bootstrap()
