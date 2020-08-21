import { Box, InitializeColorMode } from "@kleros/components";
import NextDocument, { Head, Html, Main, NextScript } from "next/document";

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head />
        <Box as="body">
          <InitializeColorMode />
          <Main />
          <NextScript />
        </Box>
      </Html>
    );
  }
}
