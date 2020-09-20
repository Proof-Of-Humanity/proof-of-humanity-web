import { Settings } from "@kleros/icons";
import { Box } from "theme-ui";

import Button from "./button";
import Divider from "./divider";
import Popup from "./popup";
import Tabs, { Tab, TabList, TabPanel } from "./tabs";
import Text from "./text";
import { useWeb3 } from "./web3-provider";

export default function AccountSettingsPopup() {
  const [accounts] = useWeb3("eth", "getAccounts");
  const { web3, connect } = useWeb3();
  return (
    <Popup
      contentStyle={{ width: 300 }}
      trigger={Settings}
      position="bottom right"
    >
      <Box
        sx={{
          color: "text",
          paddingX: 1,
          paddingY: 2,
        }}
      >
        <Text
          sx={{
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Settings
        </Text>
        <Tabs>
          <TabList>
            <Tab>Account</Tab>
            <Tab>Notifications</Tab>
          </TabList>
          <TabPanel>
            <Text
              sx={{
                fontSize: "10px",
                marginBottom: 3,
              }}
            >
              {accounts &&
                (accounts.length === 0 ? "Connected to Infura" : accounts[0])}
            </Text>
            <Text
              sx={{
                color: "success",
                fontSize: 1,
                fontWeight: "bold",
                marginBottom: 1,
                textAlign: "center",
              }}
            >
              Network: {web3.ETHNet?.name}
            </Text>
            <Divider />
            <Button
              sx={{
                display: "block",
                marginTop: -2,
                marginX: "auto",
              }}
              onClick={connect}
            >
              {accounts &&
                `${accounts.length === 0 ? "Connect" : "Change"} Account`}
            </Button>
          </TabPanel>
          <TabPanel>Notifications</TabPanel>
        </Tabs>
      </Box>
    </Popup>
  );
}
