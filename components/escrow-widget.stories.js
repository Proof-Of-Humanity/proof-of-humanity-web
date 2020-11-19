import EscrowWidget from "./escrow-widget";

const metadata = {
  title: "Widgets/EscrowWidget",
  component: EscrowWidget,
  argTypes: {
    web3: {
      type: "object",
      description:
        "An optional Web3 instance. If none is provided or accounts are not loaded, a prompt will appear to connect a wallet on first render.",
      table: {
        type: {
          summary: "Web3",
        },
      },
      control: null,
    },
    court: {
      type: "string",
      description:
        'The court that will rule over any disputes arising from a transaction. `"general"` or `"blockchain-non-technical"`, or a custom [arbitrable transaction contract](https://github.com/kleros/escrow-contracts) address.',
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "blockchain-non-technical",
    },
    currency: {
      type: "string",
      description:
        "The address of the token the transaction should be paid in. Leave this undefined to use ETH.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    metaEvidence: {
      type: { name: "object", required: true },
      description:
        "The [meta evidence object](https://github.com/ethereum/EIPs/issues/1497) for any potential disputes arising from a transaction. You can add an additional `file` property with a buffer, string, or object, and it will be uploaded to IPFS and `fileURI` will be set appropiately.",
      table: {
        type: {
          summary: "object",
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
    amount: {
      type: { name: "number", required: true },
      description: "The amount escrowed in a transaction.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    ticker: {
      type: "string",
      description: "The currency's ticker.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "ETH",
    },
    recipient: {
      type: { name: "string", required: true },
      description: "The address of the recipient of transactions.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    timeout: {
      type: { name: "number", required: true },
      description:
        "The time in seconds until a transaction becomes executable.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
  },
};
export default metadata;

function Template(args) {
  return <EscrowWidget {...args} />;
}

export const Default = Template.bind();
Default.args = {
  metaEvidence: {
    title: "Pay with Escrow",
    description:
      "Camera Nikon 83x optical zoom lens, model x32a 9, additional lens.",
    file: { contract: "someContractText" },
  },
  children: "Pay Now",
  amount: 1e18,
  recipient: "0x4b93A94ca58594FAF5f64948A26F3E195Eb63B6E",
  timeout: 604800,
};
