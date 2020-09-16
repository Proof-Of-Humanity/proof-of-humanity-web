import { forwardRef } from "react";
import { MoonLoader } from "react-spinners";
import { Box, Button as _Button } from "theme-ui";

import Popup from "./popup";
import Text from "./text";

const Button = forwardRef(
  (
    {
      id,
      sx,
      type = "button",
      disabled,
      children,
      loading,
      disabledTooltip,
      ...rest
    },
    ref
  ) => {
    const button = (
      <_Button
        ref={ref}
        id={id}
        sx={{
          backgroundImage({ colors: { primary, secondary } }) {
            return `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`;
          },
          ...sx,
        }}
        type={type}
        disabled={disabled || !children || loading}
        data-loading={loading}
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
          {loading && (
            <Box variant="buttons.primary.spinner">
              <MoonLoader size={16} />
            </Box>
          )}
        </Text>
      </_Button>
    );
    return disabled && disabledTooltip ? (
      <Popup
        trigger={
          <Box
            sx={{
              display: "inline-block",
              height: sx?.height,
              width: sx?.width,
            }}
          >
            {button}
          </Box>
        }
        on={["focus", "hover"]}
      >
        {disabledTooltip}
      </Popup>
    ) : (
      button
    );
  }
);
Button.displayName = "Button";
export default Button;
