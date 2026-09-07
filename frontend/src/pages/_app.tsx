import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@/styles/globals.css";

import type { AppProps } from "next/app";
import Head from "next/head";

import { AppProviders } from "@/app/providers/AppProviders";
import { AppLayout } from "@/components/layout/AppLayout";
import { APP_NAME } from "@/constants";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <AppProviders>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </AppProviders>
    </>
  );
}
