import { forwardRef } from "react";
import { Box } from "theme-ui";

const SVG = forwardRef(
  (
    { fill = "none", size = 16, xmlns = "http://www.w3.org/2000/svg", ...rest },
    ref
  ) => (
    <Box
      ref={ref}
      as="svg"
      fill={fill}
      height={size}
      width={size}
      xmlns={xmlns}
      {...rest}
    />
  )
);
SVG.displayName = "SVG";
export default SVG;
