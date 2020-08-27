import ReactLoadingSkeleton from "react-loading-skeleton";
import { Text as _Text } from "theme-ui";

export default function Text({ sx, children, ...rest }) {
  return (
    <_Text
      sx={children ? sx : { display: "inline-block", width: "80%", ...sx }}
      {...rest}
    >
      {children || <ReactLoadingSkeleton {...rest} />}
    </_Text>
  );
}
