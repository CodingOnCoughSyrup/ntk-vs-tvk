// pages/_app.js
import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import Head from 'next/head';
import { useRouter } from 'next/router';

const DEFAULT_TITLE = 'NTK vs TVK - A Detailed Comparison';
const DEFAULT_DESCRIPTION = 'Compare NTK and TVK using facts and data.';
const SITE_NAME = 'NTK vs TVK';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const OG_IMAGE = '/default.jpg'; // put this file in /public

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const url = `${BASE_URL}${router.asPath === '/' ? '' : router.asPath}`;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Head>
        {/* Default tab title + SEO */}
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />

        {/* Open Graph (Facebook, WhatsApp, LinkedIn…) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${BASE_URL}${OG_IMAGE}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={`${BASE_URL}${OG_IMAGE}`} />

        {/* Canonical */}
        <link rel="canonical" href={url} />
      </Head>

      <Component {...pageProps} />
    </ThemeProvider>
  );
}
