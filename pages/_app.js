import {
  ArchonProvider,
  Box,
  Flex,
  HelpPopup,
  Image,
  Layout,
  Link,
  List,
  ListItem,
  NextLink,
  RelayProvider,
  SocialIcons,
  Text,
  ThemeProvider,
  WalletConnection,
  Web3Provider,
  AccountSettingsPopup as _AccountSettingsPopup,
  createWrapConnection,
  useWeb3,
} from "@kleros/components";
import { ProofOfHumanityLogo, SecuredByKlerosWhite } from "@kleros/icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { animated, useTransition } from "react-spring";
import { useQuery } from "relay-hooks";

import { indexQuery } from "_pages/index";
import { appQuery } from "_pages/index/app-query";
import { IdQuery } from "_pages/profile/[id]";
import { queryEnums, useEvidenceFile } from "data";
import KlerosLiquid from "subgraph/abis/kleros-liquid";
import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import TransactionBatcher from "subgraph/abis/transaction-batcher";
import UBI from "subgraph/abis/ubi";
import {
  UBIAddress,
  address,
  klerosLiquidAddress,
  transactionBatcherAddress,
} from "subgraph/config";

import '../i18n/i18n';
import { useTranslation } from 'react-i18next';

import { Dropdown, Menu, message } from 'antd';

// CSS imports
import 'antd/dist/antd.css';
import './main.css';

const queries = {
  "/": indexQuery,
  "/profile/:id": IdQuery,
};
const wrapConnection = createWrapConnection(queries, queryEnums);
const theme = {
  colors: {
    vouching: "#4d00b4",
    pendingRegistration: "#ccc",
    pendingRemoval: "#ff9900",
    challengedRegistration: "#ffc700",
    challengedRemoval: "#ffc700",
    registered: "#009aff",
    removed: "#4a4a4a",
  },
};

const network = process.env.NEXT_PUBLIC_NETWORK || "mainnet";

const contracts = [
  {
    name: "proofOfHumanity",
    abi: ProofOfHumanity,
    address: { [network]: address },
  },
  {
    name: "klerosLiquid",
    abi: KlerosLiquid,
    address: { [network]: klerosLiquidAddress },
  },
  { name: "UBI", abi: UBI, address: { [network]: UBIAddress } },
  {
    name: "transactionBatcher",
    abi: TransactionBatcher,
    address: { [network]: transactionBatcherAddress },
  },
];

function MyProfileLink() {
  const [accounts] = useWeb3("eth", "getAccounts");

  const { t } = useTranslation();

  const { props } = useQuery(
    appQuery,
    {
      id: accounts?.[0]?.toLowerCase(),
      contributor: accounts?.[0]?.toLowerCase(),
    },
    { skip: !accounts?.[0] }
  );

  const showSubmitProfile =
    !props?.submission ||
    (!props?.submission?.registered && props?.submission?.status === "None");

  return accounts?.[0] ? (
    <NextLink href="/profile/[id]" as={`/profile/${accounts[0]}`}>
      <Link variant="navigation">
        {showSubmitProfile ? t('header_submit_profile') : t('header_my_profile')}
      </Link>
    </NextLink>
  ) : null;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function AccountSettingsPopup() {
  const { t, i18n } = useTranslation();
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
      label: t('header_notifications_enable'),
      info: t('header_notifications_subscribe'),
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
  
  const normalizeSettings = ({ email, ...rest }) => ({
    email: { S: email },
    ...Object.keys(rest).reduce((acc, setting) => {
      acc[setting] = {
        BOOL: rest[setting] || false,
      };
      return acc;
    }, {}),
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

const AnimatedBox = animated(Box);

export default function App({ Component, pageProps }) {
  const { t, i18n } = useTranslation();

  const router = useRouter();
  const query = useMemo(
    () => wrapConnection.parseAsPath(router.asPath).query,
    [router.asPath]
  );

  const networkFromQuery = query?.network ?? network;
  const [networkFromProvider, setNetworkFromProvider] = useState();

  const [routeChangeConnection, setRouteChangeConnection] = useState();
  const connectToRouteChange = useCallback((connection) => {
    const wrappedConnection = wrapConnection(connection);
    wrappedConnection(location.pathname + location.search);
    setRouteChangeConnection(() => wrappedConnection);
  }, []);
  
  useEffect(() => {
    if (routeChangeConnection) {
      router.events.on("routeChangeStart", routeChangeConnection);
      return () => router.events.off("routeChangeStart", routeChangeConnection);
    }
  }, [routeChangeConnection, router.events]);

  const onNetworkChange = useCallback(
    (ETHNet) => {
      const { name: _network } = ETHNet;
      if (networkFromQuery !== _network) {
        const searchParameters = new URLSearchParams(location.search);
        if (!_network) searchParameters.delete("network");
        else searchParameters.set("network", _network);

        router.replace({
          pathname: location.pathname,
          query: searchParameters.toString(),
        });
      }
      setNetworkFromProvider(ETHNet);
    },
    [router, networkFromQuery]
  );

  const transitions = useTransition(
    [{ key: router.route, Component, pageProps }],
    (item) => item.key,
    {
      from: { opacity: 0, transform: "translate3d(0%,0,0)" },
      enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
      leave: {
        opacity: 0,
        position: "absolute",
        transform: "translate3d(-100%,0,0)",
      },
    }
  );

  if (
    (networkFromProvider &&
      networkFromProvider.name !== process.env.NEXT_PUBLIC_NETWORK) ||
    network !== process.env.NEXT_PUBLIC_NETWORK
  )
    return (
      <Flex sx={{ alignItems: "center", height: "100vh", justifyContent: "center", width: "100vw" }}>
        {t('poh_unsupported_network', { network: capitalize(network) })}
      </Flex>
    );

  const apiKey = process.env.NEXT_PUBLIC_THEGRAPH_APIKEY;
  const subgraphID = process.env.NEXT_PUBLIC_SUBGRAPHID;

  const endpoint =
    process.env.NEXT_PUBLIC_TESTING === "true"
      ? `https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-${networkFromQuery}`
      : `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphID}`;

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
   //  router.reload();
  };

  // Remove hardcode to programatical list
  const menu = (
    <Menu selectedKeys ={[i18n.language]}>
      <Menu.Item key="en" onClick={() => changeLanguage('en')}><img src="/images/en.png" width="20" height="15" /> English</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="es" onClick={() => changeLanguage('es')}><img src="/images/es.png" width="20" height="15" /> Spanish</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="pt" onClick={() => changeLanguage('es')}><img src="/images/pt.png" width="20" height="15" /> Portuguese</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="fr" onClick={() => changeLanguage('es')}><img src="/images/fr.png" width="20" height="15" /> French</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="it" onClick={() => changeLanguage('es')}><img src="/images/it.png" width="20" height="15" /> Italian</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="cn" onClick={() => changeLanguage('es')}><img src="/images/cn.png" width="20" height="15" /> Chinese</Menu.Item>
    </Menu>
  );

  const header = {
    sx: {
      flexWrap: "wrap",
      paddingY: 0,
      "> div:first-of-type": {
        flexBasis: "auto",
        paddingY: 2,
      },
      "> div:nth-of-type(2)": {
        flexBasis: 400,
      },
      "> div:last-of-type": {
        flexBasis: "auto",
        paddingY: 2,
      },
    },
    left: (
      <NextLink href="/">
        <Link variant="unstyled" sx={{ display: "flex" }}>
          <ProofOfHumanityLogo size={32} />
          <Box sx={{ marginLeft: 1 }}>
            <Text>PROOF OF</Text>
            <Text>HUMANITY</Text>
          </Box>
        </Link>
      </NextLink>
    ),
    middle: (
      <List
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          listStyle: "none",
          width: "100%",
        }}
      >
        <ListItem sx={{ marginX: 2, paddingY: 2 }}>
          <NextLink href="/">
            <Link variant="navigation">{t('header_profiles')}</Link>
          </NextLink>
        </ListItem>
        <ListItem sx={{ marginX: 2, paddingY: 2 }}>
          <MyProfileLink />
        </ListItem>
        <ListItem sx={{ marginX: 2, paddingY: 2 }}>
          <Link
            variant="navigation"
            newTab
            href="https://pools.proofofhumanity.id/"
          >
            {t('header_pools')}
          </Link>
        </ListItem>
      </List>
    ),
    right: (
      <Flex
        sx={{
          alignItems: "center",
          gap: ["16px", "8px", 0],

          "> button": {
            cursor: "pointer",
            padding: [0, "4px", "8px"],

            ":hover, :focus": {
              opacity: 0.8,
              outline: "none",
            },

            "> svg": {
              fill: "white",
            },
          },
        }}
      >
        <Dropdown overlay={menu}>
          <div className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <img src={`/images/${i18n.language}.png`} width="30" height="25" />
          </div>
        </Dropdown>
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
      </Flex>
    ),
  };

  const footer = {
    sx: {
      flexWrap: "wrap",
      paddingY: 0,
      "> div:first-of-type": {
        flexBasis: "auto",
        paddingY: 2,
      },
      "> div:last-of-type": {
        flexBasis: "auto",
        paddingY: 2,
      },
    },
    middle: (
      <Link
        sx={{ alignItems: "center", display: "flex" }}
        newTab
        href="https://kleros.io"
      >
        <SecuredByKlerosWhite sx={{ width: 200 }} />
      </Link>
    ),
    left: (
      <Link
        variant="navigation"
        sx={{ fontSize: 1 }}
        newTab
        href="https://www.proofofhumanity.id/"
      >
        {t('footer_learn_more')}
      </Link>
    ),
    right: <SocialIcons color="#ffffff" />,
  };

  return (
    // <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <RelayProvider
          endpoint={endpoint}
          queries={queries}
          connectToRouteChange={connectToRouteChange}
        >
          <Web3Provider
            infuraURL={process.env.NEXT_PUBLIC_INFURA_ENDPOINT}
            contracts={contracts}
            onNetworkChange={onNetworkChange}
          >
            <ArchonProvider>
              <Layout header={header} footer={footer}>
                {transitions.map(({ key, props, item }) => {
                  // console.log('AnimatedBox', item);
                  return (
                    <AnimatedBox
                      key={key}
                      style={{
                        ...props,
                        transform: props.transform.interpolate((t) =>
                          t === "translate3d(0%,0,0)" ? undefined : t
                        ),
                      }}
                      sx={{ padding: 3 }}
                    >
                      <item.Component {...item.pageProps} />
                    </AnimatedBox>
                  );
                })}
              </Layout>
            </ArchonProvider>
          </Web3Provider>
        </RelayProvider>
      </ThemeProvider>
    // </I18nextProvider>
  );
}
