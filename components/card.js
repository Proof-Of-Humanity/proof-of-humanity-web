import { Flex, Card as _Card } from "theme-ui";

export default function Card({
  active,
  header,
  headerSx,
  mainSx,
  children,
  footer,
  footerSx,
  ...rest
}) {
  return (
    <_Card
      as={rest.disabled || rest.onClick ? "button" : _Card}
      className={active ? "active" : undefined}
      {...rest}
    >
      <Flex sx={{ flexDirection: "column" }}>
        {header && (
          <Flex
            variant="card.header"
            sx={{ alignItems: "center", ...headerSx }}
          >
            {header}
          </Flex>
        )}
        <Flex
          variant="card.main"
          sx={{
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            ...mainSx,
          }}
        >
          {children}
        </Flex>
        {footer && (
          <Flex
            variant="card.footer"
            sx={{ alignItems: "center", ...footerSx }}
          >
            {footer}
          </Flex>
        )}
      </Flex>
    </_Card>
  );
}
