// pages/_app.tsx

import React from 'react'
import { AppProps } from 'next/app'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from '@/theme/theme'
import { TinaProvider, TinaCMS } from 'tinacms'

export default function App({ Component, pageProps }: AppProps) {
  // TinaCMS のインスタンスを生成
  const cms = React.useMemo(() => new TinaCMS(), [])

  return (
    <TinaProvider cms={cms}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </TinaProvider>
  )
}
