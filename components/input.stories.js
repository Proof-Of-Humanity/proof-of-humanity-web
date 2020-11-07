import { Search } from "@kleros/icons";

import Input from "./input";

const metadata = {
  title: "Inputs/Input",
  component: Input,
  argTypes: {
    icon: {
      type: "string",
      description: "The input's icon.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    variant: {
      type: "string",
      description: "The input's theme variant.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "input",
      control: {
        type: "radio",
        options: ["input", "mutedInput"],
      },
    },
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
  return <Input {...args} />;
}

export const Default = Template.bind();
Default.args = {};

export const WithIcon = Template.bind();
WithIcon.args = { icon: <Search /> };

export const Muted = Template.bind();
Muted.args = { variant: "mutedInput" };
