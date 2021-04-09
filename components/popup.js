import { animated, useSpring } from "react-spring";
import ReactJSPopup from "reactjs-popup";
import { Box } from "theme-ui";

const AnimatedBox = animated(Box);
export default function Popup({
  contentStyle,
  overlayStyle,
  onOpen,
  onClose,
  sx,
  children,
  ...rest
}) {
  const [animatedStyle, setAnimatedStyle] = useSpring(() => ({
    opacity: 0,
    scale: 0,
    config: { tension: 300 },
  }));
  return (
    <ReactJSPopup
      contentStyle={{
        background: "none",
        border: "none",
        boxShadow: "none",
        ...contentStyle,
      }}
      overlayStyle={{ overflow: "scroll", ...overlayStyle }}
      onOpen={() => {
        setAnimatedStyle({ opacity: 1, scale: 1 });
        if (onOpen) onOpen();
      }}
      onClose={() => {
        setAnimatedStyle({ opacity: 0, scale: 0 });
        if (onClose) onClose();
      }}
      {...rest}
      arrow={false}
    >
      {(props) => (
        <AnimatedBox
          style={{
            opacity: animatedStyle.opacity,
            transform: animatedStyle.scale.interpolate(
              (scale) => `scale(${scale})`
            ),
          }}
          sx={{
            backgroundColor: "background",
            borderRadius: 3,
            boxShadow: "rgba(0, 0, 0, 0.2) 0 1px 3px",
            padding: 1,
            ...sx,
          }}
        >
          {typeof children === "function" ? children(props) : children}
        </AnimatedBox>
      )}
    </ReactJSPopup>
  );
}
