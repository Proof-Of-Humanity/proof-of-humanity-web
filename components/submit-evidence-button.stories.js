import ArchonProvider from "./archon-provider";
import SubmitEvidenceButton from "./submit-evidence-button";
import Web3Provider from "./web3-provider";

import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import { address } from "subgraph/config/kovan";

const metadata = {
  title: "Arbitration/SubmitEvidenceButton",
  component: SubmitEvidenceButton,
  argTypes: {
    contract: {
      type: { name: "string", required: true },
      description:
        "The name of the contract to call `submitEvidence` on in the Web3 provider.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    args: {
      type: { name: "array", required: true },
      description: "Arguments to pass to the submission method.",
      table: {
        type: {
          summary: "array",
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
];
function Template(args) {
  return (
    <Web3Provider
      infuraURL="wss://kovan.infura.io/ws/v3/dd555294ec53482f952f78d2d955c34d"
      contracts={contracts}
    >
      <ArchonProvider>
        <SubmitEvidenceButton {...args} />
      </ArchonProvider>
    </Web3Provider>
  );
}

export const Default = Template.bind();
Default.args = {
  contract: "proofOfHumanity",
  args: ["0xDb3ea8CbFd37D558eAcF8d0352bE3701352C1D9B"],
};
