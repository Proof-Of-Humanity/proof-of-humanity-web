import Progress from "./progress";

const metadata = {
  title: "Components/Progress",
  component: Progress,
  argTypes: {
    value: {
      type: "number",
      description: "The progressed amount.",
      table: {
        type: {
          summary: "number",
        },
      },
    },
    max: {
      type: "number",
      description: "The total amount.",
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
    "...rest": {
      type: "object",
      description: "The progress bar's additional props.",
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
  return <Progress {...args} />;
}

export const Default = Template.bind();
Default.args = { value: 8, max: 10, sx: { width: 300 } };
