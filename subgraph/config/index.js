import goerli from "./goerli";
import kovan from "./kovan";
import mainnet from "./mainnet";

const configs = { kovan, mainnet, goerli };

export const network = process.env.NEXT_PUBLIC_NETWORK || "mainnet";

export const {
  address,
  block,
  klerosLiquidAddress,
  UBIAddress,
  transactionBatcherAddress,
  klerosLiquidBlock,
} = configs[network];
