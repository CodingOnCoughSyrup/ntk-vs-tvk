import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Your SVG favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Optional fallback for older browsers */}
        <link rel="alternate icon" href="/favicon.ico" />
        {/* Optional: address browser UI color on mobile */}
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
