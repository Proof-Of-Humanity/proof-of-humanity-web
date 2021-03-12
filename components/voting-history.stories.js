import { Box } from "theme-ui";

import ArchonProvider from "./archon-provider";
import VotingHistory from "./voting-history";
import Web3Provider from "./web3-provider";

import KlerosLiquid from "subgraph/abis/kleros-liquid";
import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import { address, klerosLiquidAddress } from "subgraph/config/kovan";

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

const contracts = [
  {
    name: "proofOfHumanity",
    abi: ProofOfHumanity,
    address: { kovan: address },
  },
  {
    name: "klerosLiquid",
    abi: KlerosLiquid,
    address: { kovan: klerosLiquidAddress },
  },
];
function Template(args) {
  return (
    <Web3Provider
      infuraURL="wss://kovan.infura.io/ws/v3/76223180ca554cad9b16c8879ef4db76"
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
      roundsLength: 3,
    },
    {
      id: 1,
      reason: { startCase: "Does Not Exist" },
      disputeID: 677,
      roundsLength: 3,
    },
  ],
  arbitrator: klerosLiquidAddress,
  arbitrable: address,
};
