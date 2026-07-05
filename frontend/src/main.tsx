import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import DebtsView from './components/DebtsView'
import MortgageView from './components/MortgageView'
import AutoLoanView from './components/AutoLoanView'
import BudgetManager from './components/BudgetManager'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

import Dashboard from './pages/Dashboard'
import MetasView from './pages/MetasView'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "gastos", element: <DebtsView /> },
      { path: "presupuesto", element: <BudgetManager /> },
      { path: "metas", element: <MetasView /> },
      { path: "hipoteca", element: <MortgageView /> },
      { path: "auto", element: <AutoLoanView /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)

// Desregistrar Service Workers de PWA anteriores
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
