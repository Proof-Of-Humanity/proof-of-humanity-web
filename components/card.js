import { forwardRef } from "react";
import reactMergeRefs from "react-merge-refs";
import { animated, useSpring } from "react-spring";
import useMeasure from "react-use-measure";
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
      rotateXRotateYScale: [0, 0, 1],
      zIndex: 0,
    }));
    const [measureRef, { top, height, left, width }] = useMeasure();
    const hoverAnimationProps = variant === "primary" &&
      rest.onClick &&
      !rest.disabled && {
        style: {
          ...animatedStyle,
          boxShadow: animatedStyle.boxShadow.interpolate(
            (blur, spread) =>
              `0 6px ${blur}px ${spread}px rgba(153, 153, 153, 0.25)`
          ),
          transform: animatedStyle.rotateXRotateYScale.interpolate(
            (rotateX, rotateY, scale) =>
              `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
          ),
          ...rest.style,
        },
        onMouseEnter() {
          setAnimatedStyle({
            boxShadow: [20, 12],
            zIndex: 1,
          });
          if (rest.onMouseEnter) rest.onMouseEnter();
        },
        onMouseMove({ pageY, pageX }) {
          setAnimatedStyle({
            boxShadow: [10, 0],
            rotateXRotateYScale: [
              -(pageY - top - height / 2) / 20,
              (pageX - left - width / 2) / 20,
              1.1,
            ],
          });
          if (rest.onMouseMove) rest.onMouseMove();
        },
        onMouseLeave() {
          setTimeout(() => {
            setAnimatedStyle({
              boxShadow: [10, 0],
              rotateXRotateYScale: [0, 0, 1],
              zIndex: 0,
            });
          }, 400);
          if (rest.onMouseLeave) rest.onMouseLeave();
        },
      };
    return (
      <AnimatedCard
        ref={reactMergeRefs([ref, measureRef])}
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
