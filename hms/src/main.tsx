import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Token auto-clear
const token = localStorage.getItem("token");
if (token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      localStorage.removeItem("token");
    } else {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
      }
    }
  } catch {
    localStorage.removeItem("token");
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)