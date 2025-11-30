import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import WasteApp from './WasteApp.jsx'

// Detect subdomain to determine which app to render
const hostname = window.location.hostname;
const isWasteSubdomain = hostname.startsWith('waste.');

const RootApp = isWasteSubdomain ? WasteApp : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RootApp />
    </BrowserRouter>
  </StrictMode>,
)
