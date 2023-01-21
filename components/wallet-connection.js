import { useWindowWidth } from "@react-hook/window-size";
import { useTranslation } from "react-i18next";

import Button from "./button";
import { useWeb3 } from "./web3-provider";

export default function WalletConnection({ buttonProps }) {
  const { connect } = useWeb3();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { t } = useTranslation();
  const width = useWindowWidth();

  if (accounts?.length === 0) {
    if (width >= 850) {
      return (
        <Button {...buttonProps} onClick={connect} className="poh-header-text">
          <div className="button-label">
            {t("header_settings_connect_wallet")}
          </div>
        </Button>
      );
    }
    return (
      <Button
        {...buttonProps}
        onClick={connect}
        className="poh-header-text poh-header-text-mobile"
      >
        <div className="button-label">{t("header_connect_button")}</div>
      </Button>
    );
  }

  return null;
}
