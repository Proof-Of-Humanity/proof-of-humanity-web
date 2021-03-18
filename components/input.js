import { forwardRef } from "react";
import { Flex, Input as _Input } from "theme-ui";

const Input = forwardRef(({ icon, readOnly, sx, ...rest }, ref) => {
  const readOnlySx = readOnly ? { backgroundColor: "muted" } : {};

  return icon ? (
    <Flex sx={{ alignItems: "center", flex: 1, justifyContent: "flex-start" }}>
      {icon}
      <_Input
        ref={ref}
        readOnly={readOnly}
        sx={{
          marginLeft: 1,
          ...sx,
          ...readOnlySx,
        }}
        {...rest}
      />
    </Flex>
  ) : (
    <_Input
      ref={ref}
      readOnly={readOnly}
      sx={{ ...sx, ...readOnlySx }}
      {...rest}
    />
  );
});
Input.displayName = "Input";
export default Input;
