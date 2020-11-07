import TimeAgo from "./time-ago";

const metadata = {
  title: "Components/TimeAgo",
  component: TimeAgo,
  argTypes: {
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
      description: "[TimeAgo React](https://git.hust.cc/timeago-react) props.",
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
  return <TimeAgo {...args} />;
}

export const Default = Template.bind();
Default.args = { datetime: 1604779597464 };
