import { forwardRef } from "react";
import ReactLoadingSkeleton from "react-loading-skeleton";
import { Text as _Text } from "theme-ui";

const Text = forwardRef(({ sx, children, ...rest }, ref) => (
  <_Text
    ref={ref}
    sx={children ? sx : { display: "inline-block", width: "80%", ...sx }}
    {...rest}
  >
    {children || <ReactLoadingSkeleton {...rest} />}
  </_Text>
));
Text.displayName = "Text";
export default Text;
