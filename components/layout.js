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
function LayoutRow({ as, sx, left, middle, right }) {
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
        ...sx,
      }}
    >
      <LayoutColumn>{left}</LayoutColumn>
      <LayoutColumn justifyContent="center">{middle}</LayoutColumn>
      <LayoutColumn justifyContent="flex-end">{right}</LayoutColumn>
    </Flex>
  );
}
export default function Layout({
  header: { sx: headerSx, ...header },
  mainSx,
  children,
  footer: { sx: footerSx, ...footer },
}) {
  return (
    <Flex sx={{ flexDirection: "column", minHeight: "100vh" }}>
      {header && (
        <LayoutRow
          as="header"
          sx={{
            backgroundImage({ colors: { accent, accentComplement } }) {
              return `linear-gradient(90.13deg, ${accent} 49.89%, ${accentComplement} 93.37%)`;
            },
            ...headerSx,
          }}
          {...header}
        />
      )}
      <Box as="main" variant="layout.main" sx={{ flex: 1, ...mainSx }}>
        {children}
      </Box>
      {footer && (
        <LayoutRow
          as="footer"
          sx={{
            backgroundImage({ colors: { accent, accentComplement } }) {
              return `linear-gradient(90.12deg, ${accent} 49.9%, ${accentComplement} 93.11%)`;
            },
            ...footerSx,
          }}
          {...footer}
        />
      )}
    </Flex>
  );
}
