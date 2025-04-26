import React from 'react';
import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';

export const MdxContainer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      component="article"
      sx={{
        // 画像
        '& img': {
          maxWidth: '100%',
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1],
          my: 3,
        },
        // 見出し
        '& h2': {
          mt: 4,
          mb: 2,
          borderBottom: `2px solid ${theme.palette.divider}`,
          pb: 1,
        },
        '& h3': {
          mt: 3,
          mb: 1.5,
          color: theme.palette.text.primary,
        },
        // テキスト
        '& p': {
          mb: 2,
          lineHeight: 1.8,
        },
        '& ul, & ol': {
          pl: 3,
          mb: 2,
        },
        '& li': {
          mb: 1,
        },
        // 引用
        '& blockquote': {
          borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          pl: 2,
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
          bgcolor: theme.palette.background.default,
          mb: 2,
        },
        // コードブロックをカード風に
        '& pre': {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          p: 2,
          mb: 3,
          overflowX: 'auto',
          fontFamily: 'source-code-pro, monospace',
          fontSize: '0.875rem',
          boxShadow: theme.shadows[1],
          whiteSpace: 'pre',
        },
        '& pre code': {
          display: 'block',
          color: 'inherit',
        },
        // インラインコード
        '& code:not(pre code)': {
          fontFamily: 'source-code-pro, monospace',
          backgroundColor: alpha(theme.palette.common.white, 0.1),
          color: theme.palette.text.primary,
          borderRadius: theme.shape.borderRadius,
          px: 0.5,
        },
        // リンク
        '& a': {
          color: theme.palette.primary.main,
          textDecoration: 'underline',
        },
      }}
    >
      {children}
    </Box>
  );
};
