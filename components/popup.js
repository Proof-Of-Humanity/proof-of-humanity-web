import { animated, useSpring } from "react-spring";
import ReactJSPopup from "reactjs-popup";
import { Box } from "theme-ui";

const AnimatedBox = animated(Box);
export default function Popup({
  contentStyle,
  onOpen,
  onClose,
  children,
  ...rest
}) {
  const [animatedStyle, setAnimatedStyle] = useSpring(() => ({
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
      onOpen={() => {
        setAnimatedStyle({ scale: 1 });
        if (onOpen) onOpen();
      }}
      onClose={() => {
        setAnimatedStyle({ scale: 0 });
        if (onClose) onClose();
      }}
      {...rest}
      arrow={false}
    >
      {(props) => (
        <AnimatedBox
          style={{
            transform: animatedStyle.scale.interpolate(
              (scale) => `scale(${scale})`
            ),
          }}
          sx={{
            backgroundColor: "background",
            borderRadius: 3,
            boxShadow: "rgba(0, 0, 0, 0.2) 0 1px 3px",
          }}
        >
          {typeof children === "function" ? children(props) : children}
        </AnimatedBox>
      )}
    </ReactJSPopup>
  );
}
