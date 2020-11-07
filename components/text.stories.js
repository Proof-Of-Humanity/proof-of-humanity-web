import Text from "./text";

const metadata = {
  title: "Components/Text",
  component: Text,
  argTypes: {
    children: {
      type: "string",
      description: "The content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    variant: {
      type: "string",
      description: "The text's theme variant.",
      table: {
        type: {
          summary: "string",
        },
      },
      control: {
        type: "radio",
        options: [undefined, "clipped", "multiClipped"],
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
      description: "The text's additional props.",
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
  return <Text {...args} />;
}

export const Default = Template.bind();
Default.args = {
  children: "Some text.",
};

export const Loading = Template.bind();
Loading.args = {};

export const Clipped = Template.bind();
Clipped.args = {
  children:
    "Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. ",
  variant: "clipped",
};

export const MultiClipped = Template.bind();
MultiClipped.args = {
  children:
    "Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. Some text that repeats. ",
  variant: "multiClipped",
};
