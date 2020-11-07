import { Check, Info, X } from "@kleros/icons";

import { createEnum } from "./parsing";
import Select from "./select";

const metadata = {
  title: "Inputs/Select",
  component: Select,
  argTypes: {
    items: {
      type: { name: "array", required: true },
      description:
        "The select's options as strings or objects with `toString` methods.",
      table: {
        type: {
          summary: "array",
        },
      },
    },
    onChange: {
      type: "function",
      description: "The select's onChange handler.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
    value: {
      type: { name: "string|object", required: true },
      description: "The select's current value.",
      table: {
        type: {
          summary: "string|object",
        },
      },
    },
    label: {
      type: "string",
      description: "The select's label.",
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
      description: "The select's additional props.",
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
  return <Select {...args} />;
}

export const Strings = Template.bind();
Strings.args = {
  items: ["Option A", "Option B", "Option C"],
  value: "Option A",
  label: "Choose",
};

export const Objects = Template.bind();
const items = [
  {
    toString() {
      return "Option A";
    },
    someKey: "someValue",
  },
  {
    toString() {
      return "Option B";
    },
    someKey: "someValue",
  },
  {
    toString() {
      return "Option C";
    },
    someKey: "someValue",
  },
];
Objects.args = {
  items,
  value: items[0],
  label: "Choose",
};

export const WithIcons = Template.bind();
const itemsWithIcons = [
  {
    Icon: Info,
    color: "info",
    toString() {
      return "Option A";
    },
    someKey: "someValue",
  },
  {
    Icon: Check,
    color: "success",
    toString() {
      return "Option B";
    },
    someKey: "someValue",
  },
  {
    Icon: X,
    color: "danger",
    toString() {
      return "Option C";
    },
    someKey: "someValue",
  },
];
WithIcons.args = {
  items: itemsWithIcons,
  value: itemsWithIcons[0],
  label: "Choose",
};

export const WithEnum = Template.bind();
const statusEnum = createEnum([
  ["None", { startCase: "All" }],
  ["Info", { Icon: Info }],
  ["Success", { Icon: Check }],
  ["Danger", { Icon: X }],
]);
WithEnum.args = {
  items: statusEnum.array,
  value: statusEnum.None,
  label: "Choose",
  sx: { width: 140 },
};
