import Appeal from "./appeal";
import Web3Provider from "./web3-provider";

import KlerosLiquid from "subgraph/abis/kleros-liquid";
import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import { address, klerosLiquidAddress } from "subgraph/config";

const metadata = {
  title: "Arbitration/Appeal",
  component: Appeal,
  argTypes: {
    challenges: {
      type: { name: "array", required: true },
      description: "The list of challenge objects.",
      table: {
        type: {
          summary: "array",
        },
      },
    },
    sharedStakeMultiplier: {
      type: { name: "number", required: true },
      description: "The shared stake multiplier.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    loserStakeMultiplier: {
      type: { name: "number", required: true },
      description: "The loser stake multiplier.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    winnerStakeMultiplier: {
      type: { name: "number", required: true },
      description: "The winner stake multiplier.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    arbitrator: {
      type: { name: "string", required: true },
      description: "The arbitrator's address.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    arbitratorExtraData: {
      type: { name: "string", required: true },
      description: "The extra data passed to the arbitrator.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    contract: {
      type: { name: "string", required: true },
      description: "The arbitrable contract name in the Web3 Provider.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    args: {
      type: { name: "array", required: true },
      description: "Arguments to pass to the fundAppeal function.",
      table: {
        type: {
          summary: "array",
        },
      },
    },
  },
};
export default metadata;

const network = process.env.NEXT_PUBLIC_NETWORK || "mainnet";

const contracts = [
  {
    name: "proofOfHumanity",
    abi: ProofOfHumanity,
    address: { [network]: address },
  },
  {
    name: "klerosLiquid",
    abi: KlerosLiquid,
    address: { [network]: klerosLiquidAddress },
  },
];
function Template(args) {
  return (
    <Web3Provider
      infuraURL={process.env.NEXT_PUBLIC_INFURA_ENDPOINT}
      contracts={contracts}
    >
      <Appeal {...args} />
    </Web3Provider>
  );
}

export const Default = Template.bind();
Default.args = {
  challenges: [
    {
      id: 1,
      reason: { startCase: "Duplicate" },
      disputeID: 10,
      parties: [
        "0xDb3ea8CbFd37D558eAcF8d0352bE3701352C1D9B",
        "0x77AAbcA64973590C56D121510753b3324823d75E",
      ],
      rounds: [{ paidFees: [0, 1e18, 0], hasPaid: [false, false] }],
      lastRoundID: 3,
    },
  ],
  sharedStakeMultiplier: 2,
  loserStakeMultiplier: 3,
  winnerStakeMultiplier: 3,
  arbitrator: klerosLiquidAddress,
  arbitratorExtraData: "0x",
  contract: "proofOfHumanity",
  args: ["0xDb3ea8CbFd37D558eAcF8d0352bE3701352C1D9B"],
};
