import List, { ListItem } from "./list";

const metadata = {
  title: "Components/List",
  component: List,
  argTypes: {
    children: {
      type: "object",
      description: "`ListItem` elements.",
      table: {
        type: {
          summary: "ListItem[]",
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
      description: "The list's additional props.",
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
    <List {...args}>
      <ListItem>1</ListItem>
      <ListItem>2</ListItem>
      <ListItem>3</ListItem>
    </List>
  );
}

export const Default = Template.bind();
Default.args = {};
