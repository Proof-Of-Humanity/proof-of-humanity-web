import { forwardRef } from "react";
import { Flex, Input as _Input } from "theme-ui";

const Input = forwardRef(({ icon, ...rest }, ref) =>
  icon ? (
    <Flex sx={{ alignItems: "center", flex: 1, justifyContent: "flex-start" }}>
      {icon}
      <_Input ref={ref} {...rest} sx={{ marginLeft: 1, ...rest.sx }} />
    </Flex>
  ) : (
    <_Input ref={ref} {...rest} />
  )
);
Input.displayName = "Input";
export default Input;
