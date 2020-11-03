import Button from "./button";

const metadata = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    id: {
      type: "string",
      description: "The button element's ID.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    variant: {
      type: "string",
      description: "The button's theme variant.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "primary",
      control: {
        type: "radio",
        options: ["primary", "secondary", "select"],
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
    type: {
      type: "string",
      description: "The button's type.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "button",
    },
    disabled: {
      type: "boolean",
      description: "The button's disabled state.",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    children: {
      type: "string",
      description: "The button's content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    loading: {
      type: "boolean",
      description: "The button's loading state.",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    disabledTooltip: {
      type: "string",
      description: "The button's disabled tooltip content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    "...rest": {
      type: "object",
      description: "The button's additional props.",
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
  return <Button {...args} />;
}

export const Primary = Template.bind();
Primary.args = { children: "Click Me" };

export const PrimaryDisabled = Template.bind();
PrimaryDisabled.args = { disabled: true, children: "Click Me" };

export const PrimaryDisabledWithTooltip = Template.bind();
PrimaryDisabledWithTooltip.args = {
  disabled: true,
  children: "Click Me",
  disabledTooltip: "Oh no.",
};

export const Secondary = Template.bind();
Secondary.args = { variant: "secondary", children: "Click Me" };

export const Select = Template.bind();
Select.args = { variant: "select", children: "Click Me" };
