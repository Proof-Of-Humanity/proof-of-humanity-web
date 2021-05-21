import { Button, useContract } from "@kleros/components";
import { useCallback } from "react";

import useIsGraphSynced from "_pages/index/use-is-graph-synced";

export default function WithdrawButton({ sx, ...rest }) {
  const {
    receipt,
    send: sendWithdraw,
    loading: withdrawLoading,
  } = useContract("proofOfHumanity", "withdrawSubmission");

  const isGraphSynced = useIsGraphSynced(receipt?.blockNumber);

  const handleClick = useCallback(() => sendWithdraw(), [sendWithdraw]);

  return (
    <Button
      {...rest}
      onClick={handleClick}
      loading={withdrawLoading}
      disabled={withdrawLoading || (!!receipt && !isGraphSynced)}
      sx={{
        backgroundImage({ colors }) {
          const { danger, text } = colors;
          return `linear-gradient(90deg, ${text} -500%, ${danger} 100%)`;
        },
        ...sx,
      }}
    >
      Cancel Submission
    </Button>
  );
}
