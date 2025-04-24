// src/components/Layout.tsx
import { useContext } from 'react';
import { IconButton, useTheme, AppBar, Toolbar, Box, Link as MuiLink, Container } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NextLink from 'next/link';
import { ColorModeContext } from '../pages/_app';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar disableGutters>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', height: 64 }}>
            <MuiLink component={NextLink} href="/" underline="none" color="text.primary" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              MHWilds 個人的攻略まとめ
            </MuiLink>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>

      <Box component="footer" sx={{ textAlign: 'center', py: 3, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        MHWilds 個人的攻略まとめ
      </Box>
    </>
  );
};
