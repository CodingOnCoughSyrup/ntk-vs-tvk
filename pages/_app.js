import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
