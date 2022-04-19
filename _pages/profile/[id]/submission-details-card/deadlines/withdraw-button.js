import { Button, useContract } from "@kleros/components";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export default function WithdrawButton({ sx, ...rest }) {
  const { t } = useTranslation();

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
      {t("profile_card_cancel_submission")}
    </Button>
  );
}
