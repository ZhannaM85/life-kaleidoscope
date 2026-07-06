import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { requestPersistentStorage } from '@/infrastructure/persistence/storage-persistence'

// Fire-and-forget: ask the browser to protect IndexedDB from silent
// eviction. Idempotent per spec; the result is surfaced in Settings.
void requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
