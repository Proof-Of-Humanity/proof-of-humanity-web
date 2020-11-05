import { useState } from "react";

import Checkbox from "./checkbox";

const metadata = {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    value: {
      type: { name: "boolean|string", required: true },
      description: "The checkbox's value.",
      table: {
        type: {
          summary: "boolean|string",
        },
      },
      control: {
        type: "radio",
        options: [false, true, "mixed"],
      },
    },
    onChange: {
      type: { name: "function", required: true },
      description: "The checkbox's onChange handler.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
    disabled: {
      type: "boolean",
      description: "The checkbox's disabled state.",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    name: {
      type: "string",
      description: "The checkbox's name.",
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
      description: "The checkbox's additional props.",
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

function Template({ value: _value, onChange: _onChange, ...args }) {
  const [value, setValue] = useState(_value);
  return (
    <Checkbox
      value={value}
      onChange={(event) => {
        _onChange(event);
        setValue(event.target.value);
      }}
      {...args}
    />
  );
}

export const Checked = Template.bind();
Checked.args = { value: true };

export const Unchecked = Template.bind();
Unchecked.args = { value: false };

export const Mixed = Template.bind();
Mixed.args = { value: "mixed" };
