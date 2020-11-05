import Divider from "./divider";

const metadata = {
  title: "Components/Divider",
  component: Divider,
  argTypes: {
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
      description: "The divider's additional props.",
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
  return <Divider {...args} />;
}

export const Default = Template.bind();
Default.args = { sx: { width: 300 } };
