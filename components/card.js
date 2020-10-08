import { forwardRef } from "react";
import { animated, useSpring } from "react-spring";
import { Flex, Card as _Card } from "theme-ui";

const AnimatedCard = animated(_Card);
const Card = forwardRef(
  (
    {
      active,
      variant = "primary",
      header,
      headerSx,
      mainSx,
      children,
      footer,
      footerSx,
      ...rest
    },
    ref
  ) => {
    const [animatedStyle, setAnimatedStyle] = useSpring(() => ({
      boxShadow: [10, 0],
      position: "relative",
      top: 0,
    }));
    const hoverAnimationProps = variant === "primary" &&
      rest.onClick &&
      !rest.disabled && {
        style: {
          ...animatedStyle,
          boxShadow: animatedStyle.boxShadow.interpolate(
            (blur, spread) =>
              `0 6px ${blur}px ${spread}px rgba(255, 153, 0, 0.25)`
          ),
          ...rest.style,
        },
        onMouseEnter() {
          setAnimatedStyle({
            boxShadow: [20, 12],
            top: -8,
          });
          if (rest.onMouseEnter) rest.onMouseEnter();
        },
        onMouseLeave() {
          setAnimatedStyle({
            boxShadow: [10, 0],
            top: 0,
          });
          if (rest.onMouseLeave) rest.onMouseLeave();
        },
      };
    return (
      <AnimatedCard
        ref={ref}
        role={rest.onClick || rest.disabled ? "button" : undefined}
        className={active ? "active" : undefined}
        variant={variant}
        {...rest}
        {...hoverAnimationProps}
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
      </AnimatedCard>
    );
  }
);
Card.displayName = "Card";
export default Card;
