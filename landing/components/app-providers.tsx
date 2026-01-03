'use client'

import { Provider } from 'react-redux'
import { ThemeProvider } from '@/components/theme-provider'
import { store } from '@/lib/store'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </Provider>
  )
}
