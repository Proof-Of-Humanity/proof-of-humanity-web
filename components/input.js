import { Flex, Input as _Input } from "theme-ui";

export default function Input({ icon, ...rest }) {
  if (icon)
    return (
      <Flex
        sx={{ alignItems: "center", flex: 1, justifyContent: "flex-start" }}
      >
        {icon}
        <_Input {...rest} sx={{ marginLeft: 1, ...rest.sx }} />
      </Flex>
    );
  return <_Input {...rest} />;
}
