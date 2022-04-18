import { useTranslation } from "react-i18next";

import Button from "./button";
import NetworkTag from "./network-tag";
import { useWeb3 } from "./web3-provider";

export default function WalletConnection({ tagProps, buttonProps }) {
  const { connect } = useWeb3();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { t } = useTranslation();

  return accounts?.length > 0 ? (
    <NetworkTag {...tagProps} />
  ) : (
    <Button {...buttonProps} onClick={connect}>
      {t("header_connect_button")}
    </Button>
  );
}
