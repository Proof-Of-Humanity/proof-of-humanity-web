import Identicon from "./identicon";

const metadata = {
  title: "Components/Identicon",
  component: Identicon,
  argTypes: {
    diameter: {
      type: "number",
      description: "The identicon's diameter.",
      table: {
        type: {
          summary: "number",
        },
      },
      defaultValue: 32,
    },
    address: {
      type: "string",
      description: "The identicon's address.",
      table: {
        type: {
          summary: "string",
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
    "...rest": {
      type: "object",
      description: "The identicon's additional props.",
      table: {
        type: {
          summary: "object",
        },
      },
      control: null,
    },
  },
};
export default metadata;

function Template(args) {
  return <Identicon {...args} />;
}

export const Default = Template.bind();
Default.args = {
  address: "0xdb3ea8cbfd37d558eacf8d0352be3701352c1d9b",
};
