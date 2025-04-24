import { useState, useMemo, createContext, useEffect } from 'react'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import getDesignTokens from '../theme'
import type { AppProps } from 'next/app'

export const ColorModeContext = createContext({ toggleColorMode: () => {} })

export default function MyApp({ Component, pageProps }: AppProps) {
  // デフォルトはライト（SSRでもOKな値）
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  // 初回マウント時に localStorage からモードを読み込む
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') {
        setMode(stored)
      }
    } catch {
      /* 無視 */
    }
  }, [])

  // トグル関数もメモ化しておく
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light'
          try {
            window.localStorage.setItem('theme', next)
          } catch {
            /* 無視 */
          }
          return next
        })
      },
    }),
    []
  )

  // mode に応じてテーマを再生成
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
