import ReactLoadingSkeleton from "react-loading-skeleton";
import { Text as _Text } from "theme-ui";

export default function Text({ sx, children, ...rest }) {
  return (
    <_Text sx={children ? sx : { width: "100%", ...sx }} {...rest}>
      {children || <ReactLoadingSkeleton {...rest} />}
    </_Text>
  );
}
