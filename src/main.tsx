// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './stores/authContext'
import '@/index.css'
import App from '@/App.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
)
