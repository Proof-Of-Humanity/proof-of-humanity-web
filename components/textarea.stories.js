import Textarea from "./textarea";

const metadata = {
  title: "Inputs/Textarea",
  component: Textarea,
  argTypes: {
    onChange: {
      type: "function",
      description: "The input's onChange handler.",
      table: {
        type: {
          summary: "function",
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
      description: "The textarea's additional props.",
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
  return <Textarea {...args} />;
}

export const Default = Template.bind();
Default.args = {};
