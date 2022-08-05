import { useTranslation } from "react-i18next";

import Button from "./button";
import { useWeb3 } from "./web3-provider";

export default function WalletConnection({ buttonProps }) {
  const { connect } = useWeb3();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { t } = useTranslation();

  if (accounts?.length === 0) {
    return (
      <Button {...buttonProps} onClick={connect}>
        {t("header_connect_button")}
      </Button>
    );
  }

  return null;
}
