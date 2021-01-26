import { Box } from "theme-ui";

import Layout from "./layout";

const metadata = {
  title: "Components/Layout",
  component: Layout,
  argTypes: {
    header: {
      type: "object",
      description:
        "The header's props, with `left`, `middle`, and `right` renderables.",
      table: {
        type: {
          summary: "object",
        },
      },
      mainSx: {
        type: "object",
        description: "Theme UI sx prop for the main area.",
        table: {
          type: {
            summary: "object",
          },
        },
      },
      children: {
        type: "string",
        description: "The content of the main area.",
        table: {
          type: {
            summary: "react-renderable",
          },
        },
      },
      footer: {
        type: "object",
        description:
          "The footer's props, with `left`, `middle`, and `right` renderables.",
        table: {
          type: {
            summary: "object",
          },
        },
      },
    },
  },
};
export default metadata;

function Template(args) {
  return (
    <Box sx={{ height: "100vh", width: "100vw" }}>
      <Layout {...args} />
    </Box>
  );
}

export const Default = Template.bind();
Default.args = {
  header: { left: "Left", middle: "Middle", right: "Right" },
  children: "Body",
  footer: { left: "Left", middle: "Middle", right: "Right" },
};
