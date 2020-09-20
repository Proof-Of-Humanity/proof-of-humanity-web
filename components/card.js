import { forwardRef } from "react";
import { Flex, Card as _Card } from "theme-ui";

const Card = forwardRef(
  (
    { active, header, headerSx, mainSx, children, footer, footerSx, ...rest },
    ref
  ) => (
    <_Card
      ref={ref}
      role={rest.disabled || rest.onClick ? "button" : undefined}
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
  )
);
Card.displayName = "Card";
export default Card;
