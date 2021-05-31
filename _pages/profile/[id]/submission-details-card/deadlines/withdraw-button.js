import { Button, useContract } from "@kleros/components";
import { useCallback } from "react";

export default function WithdrawButton({ sx, ...rest }) {
  const { send: sendWithdraw } = useContract(
    "proofOfHumanity",
    "withdrawSubmission"
  );

  const handleClick = useCallback(() => sendWithdraw(), [sendWithdraw]);

  return (
    <Button
      {...rest}
      onClick={handleClick}
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
