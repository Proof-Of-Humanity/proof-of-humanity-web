import { Dot } from "@kleros/icons";
import ReactLoadingSkeleton from "react-loading-skeleton";

import Text from "./text";
import { useWeb3 } from "./web3-provider";

function capitalize(string) {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : string;
}

export default function NetworkTag({ sx, ...rest }) {
  const { web3 } = useWeb3();
  return web3.ETHNet ? (
    <Text
      sx={{
        color: "success",
        fontSize: 1,
        fontWeight: "bold",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...sx,
      }}
    >
      <Dot
        size={8}
        sx={{
          fill: "currentColor",
        }}
      />{" "}
      {capitalize(web3.ETHNet?.name)}
    </Text>
  ) : (
    <ReactLoadingSkeleton {...rest} />
  );
}
