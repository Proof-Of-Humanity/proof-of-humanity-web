import { Flex } from "theme-ui";

import Button from "./button";
import ScrollTo, { ScrollArea } from "./scroll-to";

const metadata = {
  title: "Components/ScrollTo",
  component: ScrollTo,
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
      description:
        "[React Scroll-To](https://github.com/ganderzz/react-scroll-to) props.",
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
  return (
    <ScrollTo {...args}>
      {({ scroll }) => (
        <ScrollArea
          sx={{
            borderColor: "primary",
            borderRadius: 5,
            borderStyle: "solid",
            borderWidth: 1,
            height: 300,
            overflowY: "scroll",
            padding: 2,
            width: 300,
          }}
        >
          <Button onClick={() => scroll({ y: 1000, smooth: true })}>
            Scroll Down
          </Button>
          <Flex
            sx={{
              alignItems: "center",
              height: 500,
            }}
          >
            Content
          </Flex>
          <Button onClick={() => scroll({ y: 0, smooth: true })}>
            Scroll Up
          </Button>
        </ScrollArea>
      )}
    </ScrollTo>
  );
}

export const Default = Template.bind();
Default.args = {};
