import Card from "./card";

const metadata = {
  title: "Components/Card",
  component: Card,
  argTypes: {
    active: {
      type: "boolean",
      description:
        "Whether the card should render as active or not. Useful for when cards are used as radio buttons or checkboxes.",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    variant: {
      type: "string",
      description: "The card's theme variant.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "primary",
      control: {
        type: "radio",
        options: ["primary", "muted"],
      },
    },
    header: {
      type: "string",
      description: "The header content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    headerSx: {
      type: "object",
      description: "The header's Theme UI sx prop.",
      table: {
        type: {
          summary: "object",
        },
      },
    },
    mainSx: {
      type: "object",
      description: "The main body area's Theme UI sx prop.",
      table: {
        type: {
          summary: "object",
        },
      },
    },
    children: {
      type: "string",
      description: "The main body area's content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    footer: {
      type: "string",
      description: "The footer content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    footerSx: {
      type: "object",
      description: "The footer's Theme UI sx prop.",
      table: {
        type: {
          summary: "object",
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
    onClick: {
      type: "function",
      description: "The card's onClick handler.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
    "...rest": {
      type: "object",
      description: "The card's additional props.",
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
  return <Card {...args} />;
}

export const Primary = Template.bind();
Primary.args = {
  header: "Header",
  children: "Body",
  footer: "Footer",
};

export const Muted = Template.bind();
Muted.args = {
  variant: "muted",
  children: "Body",
};
