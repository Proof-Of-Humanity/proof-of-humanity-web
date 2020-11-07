import Tabs, { Tab, TabList, TabPanel } from "./tabs";

const metadata = {
  title: "Components/Tabs",
  component: Tabs,
  argTypes: {
    children: {
      type: "object",
      description:
        "A `TabList` element with `Tab` elements, and an equal number of `TabPanel` elements.",
      table: {
        type: {
          summary: "TabList<Tab>,TabPanel[]",
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
      description: "[React Tabs](https://reactcommunity.org/react-tabs) props.",
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
    <Tabs {...args}>
      <TabList>
        <Tab>Account</Tab>
        <Tab>Notifications</Tab>
      </TabList>
      <TabPanel>Account Panel</TabPanel>
      <TabPanel>Notifications Panel</TabPanel>
    </Tabs>
  );
}

export const Default = Template.bind();
Default.args = {};
