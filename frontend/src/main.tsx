import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import DebtsView from './components/DebtsView'
import MortgageView from './components/MortgageView'
import AutoLoanView from './components/AutoLoanView'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "gastos", element: <DebtsView /> },
      { path: "hipoteca", element: <MortgageView /> },
      { path: "auto", element: <AutoLoanView /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
