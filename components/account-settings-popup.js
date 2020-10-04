import { Dot, Settings } from "@kleros/icons";
import { Box, Flex } from "theme-ui";

import Button from "./button";
import Divider from "./divider";
import Identicon from "./identicon";
import { NextETHLink } from "./next-router";
import Popup from "./popup";
import Tabs, { Tab, TabList, TabPanel } from "./tabs";
import Text from "./text";
import UserSettings from "./user-settings";
import { useWeb3 } from "./web3-provider";

export default function AccountSettingsPopup({
  name,
  userSettingsURL,
  settings,
  parseSettings,
  normalizeSettings,
}) {
  const [accounts] = useWeb3("eth", "getAccounts");
  const { web3, connect } = useWeb3();
  return (
    <Popup
      contentStyle={{ width: 300 }}
      trigger={
        <Button variant="secondary" sx={{ fontSize: 1, padding: 1 }}>
          Account <Settings />
        </Button>
      }
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
                (accounts.length === 0 ? (
                  "Connected to Infura"
                ) : (
                  <Flex sx={{ alignItems: "center" }}>
                    <Identicon address={accounts[0]} />
                    <Box sx={{ marginLeft: 1 }}>
                      {name && <Text sx={{ marginBottom: 1 }}>{name}</Text>}
                      <NextETHLink address={accounts[0]}>
                        {accounts[0]}
                      </NextETHLink>
                    </Box>
                  </Flex>
                ))}
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
              <Dot size={8} /> {web3.ETHNet?.name}
            </Text>
            <Divider />
            <Button
              variant="secondary"
              sx={{
                display: "block",
                fontSize: 1,
                marginTop: -2,
                marginX: "auto",
                padding: 1,
              }}
              onClick={connect}
            >
              {accounts &&
                `${accounts.length === 0 ? "Connect" : "Change"} Account`}
            </Button>
          </TabPanel>
          <TabPanel>
            <UserSettings
              userSettingsURL={userSettingsURL}
              settings={settings}
              parseSettings={parseSettings}
              normalizeSettings={normalizeSettings}
            />
          </TabPanel>
        </Tabs>
      </Box>
    </Popup>
  );
}
