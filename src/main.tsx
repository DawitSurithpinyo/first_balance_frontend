// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './stores/authContext'
import '@/index.css'
import App from '@/App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="1081957400734-gd6krhrfpapk4063derrrfc7pibu0mm1.apps.googleusercontent.com">
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </GoogleOAuthProvider>,
)
