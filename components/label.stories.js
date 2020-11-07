import Label from "./label";

const metadata = {
  title: "Inputs/Label",
  component: Label,
  argTypes: {
    children: {
      type: "string",
      description: "The label's content.",
      table: {
        type: {
          summary: "react-renderable",
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
      description: "The input's additional props.",
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
  return <Label {...args} />;
}

export const Default = Template.bind();
Default.args = { children: "Name" };
