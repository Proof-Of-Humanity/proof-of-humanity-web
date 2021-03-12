import {
  ArchonProvider,
  Box,
  Flex,
  Layout,
  Link,
  List,
  ListItem,
  NextLink,
  RelayProvider,
  SocialIcons,
  Text,
  ThemeProvider,
  Web3Provider,
  AccountSettingsPopup as _AccountSettingsPopup,
  createWrapConnection,
  useWeb3,
} from "@kleros/components";
import { ProofOfHumanityLogo } from "@kleros/icons";
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
import UBI from "subgraph/abis/ubi";
import {
  UBIAddress,
  address,
  klerosLiquidAddress,
} from "subgraph/config/mainnet";

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
const contracts = [
  {
    name: "proofOfHumanity",
    abi: ProofOfHumanity,
    address: { mainnet: address },
  },
  {
    name: "klerosLiquid",
    abi: KlerosLiquid,
    address: { mainnet: klerosLiquidAddress },
  },
  { name: "UBI", abi: UBI, address: { mainnet: UBIAddress } },
];
function MyProfileLink() {
  const [accounts] = useWeb3("eth", "getAccounts");
  const { props } = useQuery(
    appQuery,
    { id: accounts?.[0]?.toLowerCase() },
    { skip: !accounts?.[0] }
  );
  return accounts?.[0] ? (
    <NextLink href="/profile/[id]" as={`/profile/${accounts[0]}`}>
      <Link variant="navigation">
        {props?.submission ? "My Profile" : "Submit Profile"}
      </Link>
    </NextLink>
  ) : null;
}
const settings = {
  proofOfHumanityNotifications: {
    label: "Enable",
    info: "Subscribe to updates about submissions you are involved in.",
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
function AccountSettingsPopup() {
  const [accounts] = useWeb3("eth", "getAccounts");
  const { props } = useQuery(
    appQuery,
    { id: accounts?.[0]?.toLowerCase() },
    { skip: !accounts?.[0] }
  );
  const evidenceURI = props?.submission?.requests[0].evidence[0].URI;
  const getEvidenceFile = useEvidenceFile();
  return (
    <_AccountSettingsPopup
      name={evidenceURI && getEvidenceFile(evidenceURI)?.file?.name}
      userSettingsURL="https://hgyxlve79a.execute-api.us-east-2.amazonaws.com/production/user-settings"
      settings={settings}
      parseSettings={parseSettings}
      normalizeSettings={normalizeSettings}
    />
  );
}
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
          <Link variant="navigation">Profiles</Link>
        </NextLink>
      </ListItem>
      <ListItem sx={{ marginX: 2, paddingY: 2 }}>
        <MyProfileLink />
      </ListItem>
      <ListItem sx={{ marginX: 2, paddingY: 2 }}>
        <Link
          variant="navigation"
          newTab
          href="https://proof-of-humanity-pools.netlify.app"
        >
          Pools
        </Link>
      </ListItem>
    </List>
  ),
  right: <AccountSettingsPopup />,
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
  left: (
    <Link
      variant="navigation"
      sx={{ fontSize: 1 }}
      newTab
      href="https://proofofhumanity.id/"
    >
      Learn More
    </Link>
  ),
  right: <SocialIcons />,
};
const AnimatedBox = animated(Box);
export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { network = "mainnet" } = useMemo(
    () => wrapConnection.parseAsPath(router.asPath).query,
    [router.asPath]
  );

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
    ({ name: _network }) => {
      if (router.query.network !== _network) {
        const query = new URLSearchParams(location.search);
        if (!_network) query.delete("network");
        else query.set("network", _network);
        router.replace({
          pathname: location.pathname,
          query: query.toString(),
        });
      }
    },
    [router]
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
  return (
    <ThemeProvider theme={theme}>
      <RelayProvider
        endpoint={`https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-${network}`}
        queries={queries}
        connectToRouteChange={connectToRouteChange}
      >
        <Web3Provider
          infuraURL={`wss://${network}.infura.io/ws/v3/dd555294ec53482f952f78d2d955c34d`}
          contracts={contracts}
          onNetworkChange={onNetworkChange}
        >
          <ArchonProvider>
            {{ mainnet: true }[network] ? (
              <Layout header={header} footer={footer}>
                {transitions.map(({ key, props, item }) => (
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
                ))}
              </Layout>
            ) : (
              <Flex
                sx={{
                  alignItems: "center",
                  height: "100vh",
                  justifyContent: "center",
                  width: "100vw",
                }}
              >
                Unsupported network. Please switch to Mainnet.
              </Flex>
            )}
          </ArchonProvider>
        </Web3Provider>
      </RelayProvider>
    </ThemeProvider>
  );
}
