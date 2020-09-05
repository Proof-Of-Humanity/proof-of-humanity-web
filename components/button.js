import { forwardRef } from "react";
import { Button as _Button } from "theme-ui";

import Text from "./text";

const Button = forwardRef(({ id, sx, disabled, children, ...rest }, ref) => (
  <_Button
    ref={ref}
    id={id}
    sx={{
      backgroundImage({ colors: { primary, secondary } }) {
        return `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`;
      },
      ...sx,
    }}
    disabled={disabled || !children}
    {...rest}
  >
    <Text
      id={id && `${id}-text`}
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "space-evenly",
        minWidth: "100px",
      }}
    >
      {children}
    </Text>
  </_Button>
));
Button.displayName = "Button";
export default Button;
