import ReactJazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Box } from "theme-ui";

export default function Identicon({ diameter = 32, address, ...rest }) {
  return (
    <Box
      as={(props) => (
        <ReactJazzicon
          diameter={diameter}
          seed={jsNumberForAddress(address)}
          {...rest}
          {...props}
        />
      )}
      {...rest}
    />
  );
}
