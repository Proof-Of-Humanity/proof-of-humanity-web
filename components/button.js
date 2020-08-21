import { Button as _Button } from "theme-ui";

import Text from "./text";

export default function Button({ sx, disabled, children, ...rest }) {
  return (
    <_Button
      sx={{
        backgroundImage: ({ colors: { primary, secondary } }) =>
          `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
        ...sx,
      }}
      disabled={disabled || !children}
      {...rest}
    >
      <Text sx={{ minWidth: "100px" }}>{children}</Text>
    </_Button>
  );
}
