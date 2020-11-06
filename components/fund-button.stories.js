import Web3 from "web3";

import FundButton from "./fund-button";
import Web3Provider from "./web3-provider";

import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import { address } from "subgraph/config/kovan";

const metadata = {
  title: "Arbitration/FundButton",
  component: FundButton,
  argTypes: {
    totalCost: {
      type: { name: "object", required: true },
      description: "The total cost required.",
      table: {
        type: {
          summary: "BN",
        },
      },
    },
    totalContribution: {
      type: { name: "object", required: true },
      description: "The total amount that has already been funded.",
      table: {
        type: {
          summary: "BN",
        },
      },
    },
    contract: {
      type: { name: "string", required: true },
      description: "The name of the contract to fund in the Web3 provider.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    method: {
      type: { name: "string", required: true },
      description: "The method name to call on the contract.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    children: {
      type: { name: "string", required: true },
      description: "A title for a button or a custom renderable.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    args: {
      type: { name: "array", required: true },
      description: "Arguments to pass to the funding method.",
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
      <FundButton {...args} />
    </Web3Provider>
  );
}

export const Default = Template.bind();
Default.args = {
  totalCost: Web3.utils.toBN(2e18),
  totalContribution: Web3.utils.toBN(1e18),
  contract: "proofOfHumanity",
  method: "fundSubmission",
  children: "Fund Submission",
  args: ["0xDb3ea8CbFd37D558eAcF8d0352bE3701352C1D9B"],
};
