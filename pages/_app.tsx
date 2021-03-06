import { css } from '@emotion/react';
import { NextSeo } from 'next-seo';
import { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextSeo
        title="markdown messenger"
        description="online messenger with markdown support"
        canonical="https://markdown-messenger.herokuapp.com/"
      />
      <Head>
        <link rel="icon" href="images/logo.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
