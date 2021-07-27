import { Box } from "theme-ui";

import ArchonProvider from "./archon-provider";
import VotingHistory from "./voting-history";
import Web3Provider from "./web3-provider";

import KlerosLiquid from "subgraph/abis/kleros-liquid";
import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import { address, klerosLiquidAddress } from "subgraph/config";

const metadata = {
  title: "Arbitration/VotingHistory",
  component: VotingHistory,
  argTypes: {
    challenges: {
      type: { name: "array", required: true },
      description: "The list of challenge objects.",
      table: {
        type: {
          summary: "array",
        },
      },
      arbitrable: {
        type: { name: "string", required: true },
        description: "The arbitrable contract's address.",
        table: {
          type: {
            summary: "string",
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
      infuraURL={`wss://${network}.infura.io/ws/v3/${process.env.INFURA_API_KEY}`}
      contracts={contracts}
    >
      <ArchonProvider>
        <Box sx={{ width: "80%" }}>
          <VotingHistory {...args} />
        </Box>
      </ArchonProvider>
    </Web3Provider>
  );
}

export const Default = Template.bind();
Default.args = {
  challenges: [
    {
      id: 1,
      reason: { startCase: "Duplicate" },
      disputeID: 677,
      lastRoundID: 3,
    },
    {
      id: 1,
      reason: { startCase: "Does Not Exist" },
      disputeID: 677,
      lastRoundID: 3,
    },
  ],
  arbitrator: klerosLiquidAddress,
  arbitrable: address,
};
