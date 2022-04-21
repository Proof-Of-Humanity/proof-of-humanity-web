import { MenuOutlined } from "@ant-design/icons";
import { ProofOfHumanityLogo } from "@kleros/icons";
import { useWindowWidth } from "@react-hook/window-size";
import { Col, Drawer, Dropdown, Layout, Menu, Row } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "relay-hooks";

import {
  HelpPopup,
  Image,
  Link,
  NextLink,
  WalletConnection,
  AccountSettingsPopup as _AccountSettingsPopup,
  useWeb3,
} from ".";

import { appQuery } from "_pages/index/app-query";
import { useEvidenceFile } from "data";

const { Header } = Layout;

function MyProfileLink(props) {
  const [accounts] = useWeb3("eth", "getAccounts");

  const { t } = useTranslation();

  const { props: profile } = useQuery(
    appQuery,
    {
      id: accounts?.[0]?.toLowerCase(),
      contributor: accounts?.[0]?.toLowerCase(),
    },
    { skip: !accounts?.[0] }
  );

  const showSubmitProfile =
    !profile?.submission ||
    (!profile?.submission?.registered &&
      profile?.submission?.status === "None");

  const href =
    accounts?.[0] && !showSubmitProfile ? "/profile/[id]" : "/profile/submit";
  const link =
    accounts?.[0] && !showSubmitProfile
      ? `/profile/${accounts?.[0]}`
      : `/profile/submit`;

  return (
    <NextLink href={href} as={link}>
      <Link {...props} variant="navigation">
        {showSubmitProfile
          ? t("header_submit_profile")
          : t("header_my_profile")}
      </Link>
    </NextLink>
  );
}

function LanguageDropdown() {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const languages = [
    { name: "English", key: "en" },
    { name: "Español", key: "es" },
    { name: "Português", key: "pt" },
    { name: "Français", key: "fr" },
    { name: "Italiano", key: "it" },
    { name: "中国人", key: "cn" },
  ];

  // Remove hardcode to programatical list
  const languageMenu = (
    <Menu selectedKeys={[i18n.resolvedLanguage]}>
      {languages.map((language, i, list) => (
        <React.Fragment key={`${language.key}-divider`}>
          <Menu.Item
            className="header-language-item"
            key={language.key}
            onClick={() => changeLanguage(language.key)}
          >
            <Image
              src={`/images/flags/${language.key}.svg`}
              width="30"
              height="auto"
            />{" "}
            {language.name}
          </Menu.Item>
          {i + 1 === list.length ? null : <Menu.Divider />}
        </React.Fragment>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={languageMenu}>
      <div
        aria-hidden="true"
        className="ant-dropdown-link"
        onClick={(event) => event.preventDefault()}
        onKeyDown={(event) => event.preventDefault()}
      >
        <Image
          src={`/images/flags/${i18n.resolvedLanguage}.svg`}
          width="30"
          height="auto"
        />
      </div>
    </Dropdown>
  );
}

const normalizeSettings = ({ email, ...rest }) => ({
  email: { S: email },
  ...Object.keys(rest).reduce((acc, setting) => {
    acc[setting] = {
      BOOL: rest[setting] || false,
    };
    return acc;
  }, {}),
});

function AccountSettingsPopup() {
  const { t } = useTranslation();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { props } = useQuery(
    appQuery,
    {
      id: accounts?.[0]?.toLowerCase(),
      contributor: accounts?.[0]?.toLowerCase(),
    },
    { skip: !accounts?.[0] }
  );
  const evidenceURI = props?.submission?.requests[0].evidence[0].URI;
  const getEvidenceFile = useEvidenceFile();

  const evidence = evidenceURI ? getEvidenceFile(evidenceURI) : null;
  const displayName =
    [evidence?.file.firstName, evidence?.file.lastName]
      .filter(Boolean)
      .join(" ") || evidence?.file.name;

  const settings = {
    proofOfHumanityNotifications: {
      label: t("header_notifications_enable"),
      info: t("header_notifications_subscribe"),
    },
  };

  const parseSettings = (rawSettings) => ({
    ...Object.keys(settings).reduce((acc, setting) => {
      acc[setting] =
        rawSettings?.payload?.settings?.Item?.[setting]?.BOOL || false;
      return acc;
    }, {}),
    email: rawSettings?.payload?.settings?.Item?.email?.S || "",
  });

  return (
    <_AccountSettingsPopup
      name={displayName}
      photo={evidenceURI && getEvidenceFile(evidenceURI)?.file?.photo}
      userSettingsURL="https://hgyxlve79a.execute-api.us-east-2.amazonaws.com/production/user-settings"
      settings={settings}
      parseSettings={parseSettings}
      normalizeSettings={normalizeSettings}
    />
  );
}

function MobileNavbar({ toggleMobileMenuOpen }) {
  const [accounts] = useWeb3("eth", "getAccounts");

  const { t } = useTranslation();

  const { props: profile } = useQuery(
    appQuery,
    {
      id: accounts?.[0]?.toLowerCase(),
      contributor: accounts?.[0]?.toLowerCase(),
    },
    { skip: !accounts?.[0] }
  );

  const showSubmitProfile =
    !profile?.submission ||
    (!profile?.submission?.registered &&
      profile?.submission?.status === "None");

  return (
    <Row>
      <Col span={showSubmitProfile ? 2 : 12}>
        <MenuOutlined onClick={() => toggleMobileMenuOpen()} />
      </Col>
      {showSubmitProfile && (
        <Col span={12}>
          <Row justify="center">
            <NextLink href="/profile/submit" as="/profile/submit">
              <Link className="poh-header-text" variant="navigation">
                {" "}
                {t("header_submit_profile")}{" "}
              </Link>
            </NextLink>
          </Row>
        </Col>
      )}
      <Col span={showSubmitProfile ? 10 : 12}>
        <Row justify="center">
          <LanguageDropdown />
        </Row>
      </Col>
    </Row>
  );
}

function DesktopNavbar() {
  const { t } = useTranslation();

  return (
    <Row>
      <Col span={1} style={{ display: "flex", alignItems: "center" }}>
        <NextLink href="/" as="/">
          <Link variant="unstyled" sx={{ display: "flex" }}>
            <ProofOfHumanityLogo style={{ alignItems: "middle" }} size={32} />
          </Link>
        </NextLink>
        {/* <Box sx={{ marginLeft: 1 }}>
              <Text>PROOF OF</Text>
              <Text>HUMANITY</Text>
            </Box>
          */}
      </Col>
      <Col className="poh-header-menu" span={17}>
        <Row justify="center">
          <Col span={6} className="poh-header-item">
            <NextLink href="/" as="/">
              <Link className="poh-header-text" variant="navigation">
                {t("header_profiles")}
              </Link>
            </NextLink>
          </Col>
          <Col span={8} className="poh-header-item">
            <MyProfileLink className="poh-header-text" />
          </Col>
        </Row>
      </Col>
      <Col flex="auto" span={6}>
        <Row justify="end" align="middle">
          <LanguageDropdown />
          <WalletConnection
            buttonProps={{
              sx: {
                backgroundColor: "white",
                backgroundImage: "none !important",
                color: "accent",
                boxShadow: "none !important",
                fontSize: [16, 12],
                px: "16px !important",
                py: "8px !important",
                mx: [0, "4px", "8px"],
              },
            }}
            tagProps={{
              sx: {
                opacity: 0.8,
                fontSize: [20, 16, 12],
                mx: [0, "4px", "8px"],
              },
            }}
          />
          <Link href="https://snapshot.org/#/poh.eth/">
            <Image src="/images/governance.png" width={25} sx={{ margin: 1 }} />
          </Link>
          <AccountSettingsPopup />
          <HelpPopup />
        </Row>
      </Col>
    </Row>
  );
}

export default function AppHeader() {
  const { t } = useTranslation();

  const width = useWindowWidth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function toggleMobileMenuOpen() {
    if (!mobileMenuOpen) {
      setMobileMenuOpen(true);
    } else {
      setMobileMenuOpen(false);
    }
  }

  const isDesktop = width >= 768;

  return (
    <>
      <Drawer
        width={200}
        title="Proof of Humanity"
        placement="left"
        closable={false}
        onClose={() => setMobileMenuOpen(false)}
        visible={mobileMenuOpen}
      >
        <Row onClick={() => setMobileMenuOpen(false)}>
          <NextLink href="/" as="/">
            <Link className="poh-drawer-text" variant="navigation">
              {t("header_profiles")}
            </Link>
          </NextLink>
        </Row>
        <Row onClick={() => setMobileMenuOpen(false)}>
          <MyProfileLink className="poh-drawer-text" />
        </Row>
      </Drawer>
      <Header className="poh-header">
        {isDesktop ? (
          <DesktopNavbar />
        ) : (
          <MobileNavbar toggleMobileMenuOpen={toggleMobileMenuOpen} />
        )}
      </Header>
    </>
  );
}
