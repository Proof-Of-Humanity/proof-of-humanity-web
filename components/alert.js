import { Info } from "@kleros/icons";
import { Box, Flex } from "theme-ui";

import Text from "./text";

export default function Alert({ type = "info", title, children }) {
  const Icon = { info: Info }[type];
  return (
    <Flex
      variant={`alert.${type}`}
      sx={{ alignItems: "center", backgroundColor: "background" }}
    >
      <Icon variant={`alert.${type}.icon`} size={24} />
      <Box sx={{ marginLeft: 2 }}>
        <Text variant={`alert.${type}.title`}>{title}</Text>
        <Text>{children}</Text>
      </Box>
    </Flex>
  );
}
