import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">MHWilds自分用攻略サイト</Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, mb: 4 }}>{children}</Container>
      <footer style={{ textAlign: 'center', padding: '1rem 0' }}>© 2025 あなたの名前</footer>
    </>
  );
}
