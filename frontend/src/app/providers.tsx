'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      pink: '#eb088a',
      purple: '#8a08eb',
    },
  },
  fonts: {
    heading: 'var(--font-orbitron), "Orbitron", sans-serif',
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'transparent',
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
