import Alert from "./alert";

const metadata = {
  title: "Components/Alert",
  component: Alert,
  argTypes: {
    type: {
      type: "string",
      description: "The alert's type.",
      table: {
        type: {
          summary: "string",
        },
      },
      defaultValue: "info",
      control: {
        type: "radio",
        options: ["info"],
      },
    },
    title: {
      type: "string",
      description: "The alert's title.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
    children: {
      type: "string",
      description: "The alert's content.",
      table: {
        type: {
          summary: "react-renderable",
        },
      },
    },
  },
};
export default metadata;

function Template(args) {
  return <Alert {...args} />;
}

export const Info = Template.bind();
Info.args = {
  title: "For Contributors",
  children:
    "If this side wins, you get back your contribution and a 10% reward.",
};

export const InfoLoading = Template.bind();
InfoLoading.args = { title: "For Contributors" };
