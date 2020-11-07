import SocialIcons from "./social-icons";

const metadata = {
  title: "Components/SocialIcons",
  component: SocialIcons,
  argTypes: {
    twitter: {
      type: "boolean",
      description: "Whether to show Twitter or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    github: {
      type: "boolean",
      description: "Whether to show GitHub or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    blog: {
      type: "boolean",
      description: "Whether to show the Kleros blog or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    linkedIn: {
      type: "boolean",
      description: "Whether to show LinkedIn or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    telegram: {
      type: "boolean",
      description: "Whether to show Telegram or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
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
  },
};
export default metadata;

function Template(args) {
  return <SocialIcons {...args} />;
}

export const Default = Template.bind();
Default.args = { sx: { stroke: "text", path: { fill: "text" } } };
