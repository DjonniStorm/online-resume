import { MantineProvider, createTheme } from '@mantine/core';
import type { PropsWithChildren } from 'react';

const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
});

export function AppMantineProvider({ children }: PropsWithChildren) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
