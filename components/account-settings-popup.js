import { useWindowWidth } from "@react-hook/window-size";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "relay-hooks";
import { Box, Flex } from "theme-ui";

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

/**
 * @summary shortens the username if its a crypto address
 * @param {object} publicAddress string of username to check
 * @returns {string} username string
 */
const _shortenCryptoName = (publicAddress) => {
  if (publicAddress.length === 42 && publicAddress.slice(0, 2) === "0x") {
    return `${publicAddress.slice(0, 6)}...${publicAddress.slice(38, 42)}`;
  }
  return publicAddress;
};

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
  const width = useWindowWidth();
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
    if (!ProofOfHumanityAbi || !pohAddress) {
      return;
    }
    return new web3.eth.Contract(ProofOfHumanityAbi, pohAddress);
  }, [web3.eth.Contract]);

  const withdrawFeesAndRewards = useCallback(() => {
    if (!batchSend || withdrawableContributions?.length === 0) {
      return;
    }
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
    <Popup
      contentStyle={{
        width: 490,
        marginTop: 15,
        lineHeight: "initial",
        cursor: "pointer",
      }}
      trigger={
        <Button
          className={
            width >= 850
              ? "poh-header-text"
              : "poh-header-text poh-header-text-mobile"
          }
          sx={{
            backgroundColor: "transparent",
            backgroundImage: "none !important",
            color: "white",
            boxShadow: "none !important",
            fontSize: 16,
            border: "1px solid #ffffff1d",
            paddingTop: "9px !important",
            paddingBottom: "5px !important",
            mx: [0, "4px", "8px"],
          }}
        >
          <Image
            src="/images/eth.svg"
            crossOrigin="anonymous"
            sx={{
              height: "20px",
              width: "20px",
              marginRight: "10px",
              marginTop: "0px",
              marginLeft: "-5px",
              minWidth: "auto",
            }}
          />
          {accounts && accounts.length > 0
            ? _shortenCryptoName(accounts[0])
            : t("header_settings_connect_wallet")}
        </Button>
      }
      position="bottom right"
    >
      <Box
        className="poh-address-popup"
        sx={{ color: "text", paddingX: 1, paddingY: 2 }}
      >
        <Tabs>
          <TabList>
            <Tab>{t("header_settings_account")}</Tab>
            <Tab>{t("header_settings_notifications")}</Tab>
          </TabList>
          <TabPanel>
            <NetworkTag sx={{ mb: 1 }} />
            <Text sx={{ fontSize: 14, marginBottom: 3 }}>
              {accounts &&
                (accounts.length === 0 ? (
                  t("header_settings_connected_infura")
                ) : (
                  <Flex sx={{ alignItems: "center", justifyContent: "center" }}>
                    {photo ? (
                      <Image
                        crossOrigin="anonymous"
                        sx={{ objectFit: "contain", width: 32, height: 32 }}
                        variant="avatar"
                        src={photo}
                      />
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
            <Divider sx={{ opacity: 0, marginBottom: 15 }} />
            <Button
              className="poh-button"
              sx={{
                display: "block",
                marginTop: -2,
                marginX: "auto",
                class: "asdasd",
                lineHeight: "initial",
                lineHeights: { button: "initial" },
              }}
              onClick={changeWallet}
            >
              {accounts && accounts.length === 0
                ? t("header_settings_connect_wallet")
                : t("header_settings_change_wallet")}
            </Button>
            {withdrawableContributions?.length > 0 && (
              <Button
                sx={{ display: "block", marginTop: 2, marginX: "auto" }}
                onClick={withdrawFeesAndRewards}
              >
                {t("header_settings_withdraw_fees_rewards")}
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
