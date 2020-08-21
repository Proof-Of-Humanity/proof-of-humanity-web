import { Settings } from "@kleros/icons";
import { Box } from "theme-ui";

import Button from "./button";
import Divider from "./divider";
import Popup from "./popup";
import Tabs, { Tab, TabList, TabPanel } from "./tabs";
import Text from "./text";
import { useWeb3 } from "./web3-provider";

export default function AccountSettingsPopup() {
  const { value: accounts } = useWeb3("eth", "getAccounts");
  const { value: networkID } = useWeb3("eth.net", "getId");
  const { connect } = useWeb3();
  return (
    <Popup
      contentStyle={{ width: 300 }}
      position="bottom right"
      trigger={Settings}
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
                color: "highlight",
                marginBottom: 1,
                textAlign: "center",
              }}
            >
              Network: {{ 42: "Kovan", 1: "Mainnet" }[networkID]}
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
