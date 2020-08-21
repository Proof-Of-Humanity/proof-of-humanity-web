import { forwardRef } from "react";
import { Box } from "theme-ui";

const SVG = forwardRef((props, ref) => <Box as="svg" {...props} ref={ref} />);
SVG.displayName = "SVG";
export default SVG;
