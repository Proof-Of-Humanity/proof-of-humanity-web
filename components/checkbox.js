import { useMixedCheckbox } from "@reach/checkbox";
import { useRef } from "react";
import { animated, useSpring } from "react-spring";
import { Box } from "theme-ui";

import Input from "./input";
import SVG from "./svg";

const indeterminateD =
  "M 18 11 H 17.6466 C 18 11 15 11 15 11 L 11 11 L 8.0497 11.0003 C 8 11 8 11 7 11 H 6 C 5 11 6 11 5 11 L 5 13 C 5 13 9 13 9 13 C 9 13 10 13 10 13 C 10 13 11 13 11 13 C 11 13 12 13 12 13 L 18 13 C 18 13 18 11 18 11 Z";
const checkD =
  "M19.4165 6H17.6466C17.2617 6 16.8956 6.18492 16.6692 6.50192L10.7367 14.7289L8.04973 11.0003C7.8233 10.6871 7.46102 10.4984 7.07231 10.4984H5.30238C5.05709 10.4984 4.91368 10.7777 5.05709 10.9777L9.75928 17.4989C9.87036 17.6539 10.0168 17.7802 10.1865 17.8674C10.3561 17.9545 10.5441 18 10.7348 18C10.9255 18 11.1135 17.9545 11.2832 17.8674C11.4528 17.7802 11.5993 17.6539 11.7103 17.4989L19.658 6.47928C19.8052 6.27926 19.6618 6 19.4165 6Z";
function Checked(props) {
  return (
    <>
      <animated.rect height={24} rx={3} width={24} />
      <animated.path {...props} />
    </>
  );
}
function Unchecked(props) {
  return (
    <animated.rect height={23} rx={2.5} width={23} x={0.5} y={0.5} {...props} />
  );
}
export default function Checkbox({ value, onChange, disabled, name, ...rest }) {
  const ref = useRef();
  const [inputProps, { checked }] = useMixedCheckbox(ref, {
    checked: value,
    onChange,
    disabled,
  });

  const checkedAnimatedStyle = useSpring({
    d: checked === "mixed" || !checked ? indeterminateD : checkD,
  });
  const uncheckedAnimatedStyle = useSpring({
    scale: checked ? 0 : 1,
    transformOrigin: "center",
    config: { mass: 3, tension: 300 },
  });
  return (
    <Box variant="forms.checkbox" {...rest}>
      <Input
        ref={ref}
        sx={{
          height: 1,
          opacity: 0,
          overflow: "hidden",
          position: "absolute",
          width: 1,
          zIndex: -1,
        }}
        name={name}
        {...inputProps}
      />
      <SVG
        sx={{
          ":hover": {
            opacity: 0.8,
          },
          "input:focus ~ &": {
            "rect:nth-of-type(2)": {
              stroke: "highlight",
            },
          },
          "rect:nth-of-type(1)": {
            fill: "highlight",
          },
          path: { fill: "background" },
          "rect:nth-of-type(2)": {
            fill: "background",
            stroke: "skeleton",
          },
        }}
        viewBox="0 0 24 24"
      >
        <Checked d={checkedAnimatedStyle.d} />
        <Unchecked
          style={{
            ...uncheckedAnimatedStyle,
            transform: uncheckedAnimatedStyle.scale.interpolate(
              (scale) => `scale(${scale})`
            ),
          }}
        />
      </SVG>
    </Box>
  );
}
