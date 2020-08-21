import { Box, Flex } from "theme-ui";

function LayoutColumn({ justifyContent, children }) {
  return (
    <Flex
      sx={{
        alignItems: "center",
        flex: 1,
        justifyContent,
        "> *": {
          marginX: 1,
        },
      }}
    >
      {children}
    </Flex>
  );
}
function LayoutRow({ as, left, middle, right }) {
  return (
    <Flex
      as={as}
      variant={`layout.${as}`}
      sx={{
        paddingX: 3,
        paddingY: 2,
        "> *": {
          marginX: 1,
        },
      }}
    >
      <LayoutColumn>{left}</LayoutColumn>
      <LayoutColumn justifyContent="center">{middle}</LayoutColumn>
      <LayoutColumn justifyContent="flex-end">{right}</LayoutColumn>
    </Flex>
  );
}
export default function Layout({ children, header, footer }) {
  return (
    <Flex sx={{ flexDirection: "column", minHeight: "100vh" }}>
      {header && <LayoutRow as="header" {...header} />}
      <Box as="main" variant="layout.main" sx={{ flex: 1 }}>
        {children}
      </Box>
      {footer && <LayoutRow as="footer" {...footer} />}
    </Flex>
  );
}
