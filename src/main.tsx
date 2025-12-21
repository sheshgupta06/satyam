import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CartProvider } from './hooks/useCart'

// ✅ Suppress Console Warnings
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

console.warn = (...args: any[]) => {
  const message = String(args[0] || '');
  if (
    message.includes('React DevTools') ||
    message.includes('react-devtools') ||
    message.includes('Future Flag') ||
    message.includes('v7_startTransition') ||
    message.includes('Tracking Prevention') ||
    message.includes('blocked access to storage')
  ) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args: any[]) => {
  const message = String(args[0] || '');
  if (
    message.includes('React DevTools') ||
    message.includes('react-devtools') ||
    message.includes('Future Flag') ||
    message.includes('v7_startTransition') ||
    message.includes('Tracking Prevention') ||
    message.includes('blocked access to storage')
  ) {
    return;
  }
  originalError(...args);
};

console.log = (...args: any[]) => {
  const message = String(args[0] || '');
  if (
    message.includes('Tracking Prevention') ||
    message.includes('blocked access to storage')
  ) {
    return;
  }
  originalLog(...args);
};

// Create router and opt-in to the v7 startTransition future flag
const router = createBrowserRouter(
  [
    { path: '/*', element: <App /> },
  ],
  {
    future: ({ v7_startTransition: true } as any),
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </React.StrictMode>,
)