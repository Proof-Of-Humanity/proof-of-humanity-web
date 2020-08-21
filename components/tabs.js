import {
  Tab as _Tab,
  TabList as _TabList,
  TabPanel as _TabPanel,
  Tabs as _Tabs,
} from "react-tabs";
import { Box } from "theme-ui";

export default function Tabs(props) {
  return <Box as={_Tabs} {...props} />;
}

export function TabList({ sx, ...rest }) {
  return (
    <Box
      as={_TabList}
      sx={{
        display: "flex",
        listStyle: "none",
        variant: "tabs.tabList",
        ...sx,
      }}
      {...rest}
    />
  );
}
TabList.tabsRole = "TabList";

export function Tab({ sx, ...rest }) {
  return (
    <Box
      as={_Tab}
      sx={{
        flex: 1,
        variant: "tabs.tab",
        ...sx,
      }}
      {...rest}
    />
  );
}
Tab.tabsRole = "Tab";

export function TabPanel(props) {
  return <Box as={_TabPanel} {...props} />;
}
TabPanel.tabsRole = "TabPanel";
