import Button from "./button";
import NetworkTag from "./network-tag";
import { useWeb3 } from "./web3-provider";

export default function WalletConnection({ tagProps, buttonProps }) {
  const [accounts] = useWeb3("eth", "getAccounts");
  const { connect } = useWeb3();

  return accounts?.length > 0 ? (
    <NetworkTag {...tagProps} />
  ) : (
    <Button {...buttonProps} onClick={connect}>
      Connect
    </Button>
  );
}
