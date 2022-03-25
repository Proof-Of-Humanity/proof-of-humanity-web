import { Settings } from "@kleros/icons";
import { useCallback, useMemo } from "react";
import { useQuery } from "relay-hooks";
import { Box, Flex, IconButton } from "theme-ui";

import Button from "./button";
import Divider from "./divider";
import Identicon from "./identicon";
import Image from "./image";
import NetworkTag from "./network-tag";
import { NextETHLink } from "./next-router";
import { zeroAddress } from "./parsing";
import Popup from "./popup";
import Tabs, { Tab, TabList, TabPanel } from "./tabs";
import Text from "./text";
import UserSettings from "./user-settings";
import { useContract, useWeb3 } from "./web3-provider";

import { appQuery } from "_pages/index/app-query";
import ProofOfHumanityAbi from "subgraph/abis/proof-of-humanity";
import { address as pohAddress } from "subgraph/config";
import { useTranslation } from 'react-i18next';

export default function AccountSettingsPopup({
  name,
  photo,
  userSettingsURL,
  settings,
  parseSettings,
  normalizeSettings,
}) {
  const { t } = useTranslation();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { connect, web3 } = useWeb3();
  const { props } = useQuery(appQuery, {
    contributor: accounts?.[0] || zeroAddress,
    id: accounts?.[0] || zeroAddress,
  });
  const changeWallet = useCallback(() => {
    // Delete walletconnect connection, if any.
    // Otherwise users can get stuck with a buggy connection.
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    connect();
  }, [connect]);

  const { contributions: withdrawableContributions } = props ?? {};
  const { send: batchSend } = useContract("transactionBatcher", "batchSend");
  const pohInstance = useMemo(() => {
    if (!ProofOfHumanityAbi || !pohAddress) return;
    return new web3.eth.Contract(ProofOfHumanityAbi, pohAddress);
  }, [web3.eth.Contract]);

  const withdrawFeesAndRewards = useCallback(() => {
    if (!batchSend || withdrawableContributions?.length === 0) return;
    const withdrawCalls = withdrawableContributions.map(
      (withdrawableContribution) => {
        const { requestIndex, roundIndex, round } = withdrawableContribution;
        const { challenge } = round;
        const { request, challengeID } = challenge;
        const { submission } = request;
        const { id } = submission;
        return pohInstance.methods
          .withdrawFeesAndRewards(
            accounts[0],
            id,
            requestIndex,
            challengeID,
            roundIndex
          )
          .encodeABI();
      }
    );
    batchSend(
      [...new Array(withdrawCalls.length).fill(pohAddress)],
      [...new Array(withdrawCalls.length).fill(web3.utils.toBN(0))],
      withdrawCalls
    );
  }, [
    accounts,
    batchSend,
    pohInstance.methods,
    web3.utils,
    withdrawableContributions,
  ]);

  return (
    <Popup contentStyle={{ width: 490, lineHeight: 'initial' }} trigger={ <IconButton><Settings size="auto" /></IconButton> } position="bottom right">
      <Box sx={{ color: "text", paddingX: 1, paddingY: 2 }} >
        <Text sx={{ fontWeight: "bold", textAlign: "center" }} >
          {t('header_settings')}
        </Text>
        <Tabs>
          <TabList>
            <Tab>{t('header_settings_account')}</Tab>
            <Tab>{t('header_settings_notifications')}</Tab>
          </TabList>
          <TabPanel>
            <Text sx={{ fontSize: 14, marginBottom: 3 }} >
              {accounts &&
                (accounts.length === 0 ? t('header_settings_connected_infura') : (
                  <Flex sx={{ alignItems: "center" }}>
                    {photo ? (
                      <Image sx={{ objectFit: "contain", width: 32, height: 32 }} variant="avatar" src={photo} />
                    ) : (
                      <Identicon address={accounts[0]} />
                    )}
                    <Box sx={{ marginLeft: 1 }}>
                      {name && (
                        <Text sx={{ fontSize: 0, marginBottom: "4px" }}>
                          {name}
                        </Text>
                      )}
                      <NextETHLink address={accounts[0]}>
                        {accounts[0]}
                      </NextETHLink>
                    </Box>
                  </Flex>
                ))}
            </Text>
            <NetworkTag sx={{ mb: 1 }} />
            <Divider />
            <Button sx={{ display: "block", marginTop: -2, marginX: "auto", class: 'asdasd', lineHeight: 'initial', lineHeights: { 'button': 'initial'}}} onClick={changeWallet} >
              {accounts && accounts.length === 0 ? t('header_settings_connect_wallet') : t('header_settings_change_wallet')}
            </Button>
            {withdrawableContributions?.length > 0 && (
              <Button sx={{ display: "block", marginTop: 2, marginX: "auto" }} onClick={withdrawFeesAndRewards} >
                {t('header_settings_withdraw_fees_rewards')}
              </Button>
            )}
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
