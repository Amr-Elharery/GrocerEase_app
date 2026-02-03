import { ThemeProvider } from '@/lib/theme-context';
import { Stack } from 'expo-router';
import './global.css';

export default function RootLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <Stack />
    </ThemeProvider>
  );
}
