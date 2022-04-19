import {
  Box,
  GoogleFont,
  InitializeColorMode,
  typographyTheme,
} from "@kleros/components";
import NextDocument, { Head, Html, Main, NextScript } from "next/document";

const typography = { options: typographyTheme };

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <GoogleFont typography={typography} />
          <meta
            property="og:title"
            content="Proof of Humanity, a sybil-proof list of humans."
          />
          <meta
            property="og:description"
            content="Proof of Humanity, a system combining webs of trust, with reverse Turing tests, and dispute resolution to create a sybil-proof list of humans."
          />
          <meta
            property="og:image"
            content="https://app.proofofhumanity.id/images/open-graph-image.png"
          />
          <meta property="og:url" content="https://www.proofofhumanity.id/" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <Box as="body">
          <InitializeColorMode />
          <Main />
          <NextScript />
        </Box>
      </Html>
    );
  }
}
