import { Button, useContract } from "@kleros/components";
import { useCallback } from "react";

import useIsGraphSynced from "_pages/index/use-is-graph-synced";

export default function WithdrawButton(props) {
  const { receipt, send: sendWithdraw, loading: withdrawLoading } = useContract(
    "proofOfHumanity",
    "withdrawSubmission"
  );

  const isGraphSynced = useIsGraphSynced(receipt?.blockNumber);

  const handleClick = useCallback(() => sendWithdraw(), [sendWithdraw]);

  return (
    <Button
      {...props}
      onClick={handleClick}
      loading={withdrawLoading}
      disabled={withdrawLoading || (!!receipt && !isGraphSynced)}
    >
      Withdraw Submission
    </Button>
  );
}
