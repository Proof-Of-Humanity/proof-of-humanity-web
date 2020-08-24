import { Box, InitializeColorMode, typographyTheme } from "@kleros/components";
import NextDocument, { Head, Html, Main, NextScript } from "next/document";
import { GoogleFont } from "react-typography";

const typography = { options: typographyTheme };
export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <GoogleFont typography={typography} />
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
