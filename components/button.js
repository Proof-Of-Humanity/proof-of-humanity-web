import { forwardRef, useRef } from "react";
import ReactRipples from "react-ripples";
import { MoonLoader } from "react-spinners";
import { Box, Button as _Button } from "theme-ui";

import Popup from "./popup";
import Text from "./text";

const Button = forwardRef(
  (
    {
      id,
      variant = "primary",
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
    const innerRef = useRef();
    const button = (
      <_Button
        ref={ref}
        id={id}
        variant={variant}
        sx={{
          backgroundImage({ colors: { primary, secondary } }) {
            return `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`;
          },
          position: "relative",
          ":focus": {
            boxShadow({ colors: { text } }) {
              return `0 0 1px ${text}`;
            },
          },
          ...sx,
        }}
        type={type}
        disabled={disabled || !children || loading}
        data-loading={loading}
        {...rest}
      >
        <Text
          ref={innerRef}
          id={id && `${id}-text`}
          variant={`buttons.${variant}`}
          sx={{
            alignItems: "center",
            display: "flex",
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
        <Box
          as={ReactRipples}
          sx={{
            borderRadius({
              buttons: {
                [variant]: { borderRadius },
              },
            }) {
              return borderRadius;
            },
            height: "100%",
            left: 0,
            position: "absolute !important",
            top: 0,
            width: "100%",
          }}
          onClick={() => innerRef.current.click()}
        />
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
