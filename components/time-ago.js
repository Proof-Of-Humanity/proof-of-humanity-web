import { Box } from "theme-ui";
import TimeagoReact from "timeago-react";

export default function TimeAgo(props) {
  return (
    <Box
      as={(boxProps) => <TimeagoReact {...props} {...boxProps} />}
      {...props}
    />
  );
}
