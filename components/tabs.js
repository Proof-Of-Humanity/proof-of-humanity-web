import { useEffect, useState } from "react";
import { animated, useSpring } from "react-spring";
import {
  Tab as _Tab,
  TabList as _TabList,
  TabPanel as _TabPanel,
  Tabs as _Tabs,
} from "react-tabs";
import useMeasure from "react-use-measure";
import { Box } from "theme-ui";

export default function Tabs(props) {
  return <Box as={_Tabs} {...props} />;
}

const AnimatedBox = animated(Box);
export function TabList({ sx, ...rest }) {
  const [tabIndex, setTabIndex] = useState(0);
  useEffect(() => {
    const _tabIndex = rest.children.findIndex((tab) => tab.props.selected);
    if (tabIndex !== _tabIndex) setTabIndex(_tabIndex);
  }, [rest.children, tabIndex]);

  const [measureRef, { width: _width, left }] = useMeasure();
  const width = _width / rest.children.length;
  const animatedStyle = useSpring({
    left: tabIndex * width,
  });
  return (
    <Box key={left} ref={measureRef} sx={{ position: "relative" }}>
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
      <AnimatedBox
        style={animatedStyle}
        sx={{
          backgroundColor: "primary",
          bottom: 0,
          height: 2,
          position: "absolute",
          width,
        }}
      />
    </Box>
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
