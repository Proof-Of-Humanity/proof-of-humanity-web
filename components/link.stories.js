import Link from "./link";

const tabPropName = "newTab";
const metadata = {
  title: "Components/Link",
  component: Link,
  argTypes: {
    [tabPropName]: {
      type: "boolean",
      description: "Whether to open the link in a new tab or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    children: {
      type: "string",
      description: "The link's content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    variant: {
      type: "string",
      description: "The link's theme variant.",
      table: {
        type: {
          summary: "string",
        },
      },
      control: {
        type: "radio",
        options: [undefined, "navigation", "unstyled"],
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
      description: "The link's additional props.",
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
  return <Link {...args} />;
}

export const Default = Template.bind();
Default.args = {
  [tabPropName]: true,
  children: "Kleros Website",
  href: "https://kleros.io",
};

export const Navigation = Template.bind();
Navigation.args = {
  [tabPropName]: true,
  children: "Kleros Website",
  variant: "navigation",
  href: "https://kleros.io",
};

export const Unstyled = Template.bind();
Unstyled.args = {
  [tabPropName]: true,
  children: "Kleros Website",
  variant: "unstyled",
  href: "https://kleros.io",
};
