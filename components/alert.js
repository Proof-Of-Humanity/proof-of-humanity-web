import { Info, Warning } from "@kleros/icons";
import { Box, Flex } from "theme-ui";

import Text from "./text";

export default function Alert({ type = "info", title, children, sx, ...rest }) {
  const Icon = { info: Info, warning: Warning }[type];
  return (
    <Flex
      variant={`alert.${type}`}
      sx={{ ...sx, alignItems: "center", backgroundColor: "background" }}
      {...rest}
    >
      <Icon variant={`alert.${type}.icon`} size={24} />
      <Box sx={{ marginLeft: 2 }}>
        <Text variant={`alert.${type}.title`}>{title}</Text>
        <Text>{children}</Text>
      </Box>
    </Flex>
  );
}
