import EthereumAccount from "./ethereum-account";
import { zeroAddress } from "./parsing";

const metadata = {
  title: "Web3/EthereumAccount",
  component: EthereumAccount,
  argTypes: {
    address: {
      type: "string",
      description: "The account's address.",
      defaultValue: zeroAddress,
      table: {
        type: {
          summary: "string",
        },
      },
    },
    diameter: {
      type: "number",
      description: "The diameter of the identicon.",
      defaultValue: 24,
      table: {
        type: {
          summary: "number",
        },
      },
    },
    sx: {
      type: "object",
      description: "Theme UI sx prop.",
      table: {
        type: {
          summary: "object",
        },
      },
    },
  },
};
export default metadata;

function Template(args) {
  return <EthereumAccount {...args} />;
}

export const Basic = Template.bind({});
Basic.args = {
  address: "0x1111111111111111111111111111111111111111",
  diameter: 24,
};

export const Loading = Template.bind({});
Loading.args = {
  address: null,
};
