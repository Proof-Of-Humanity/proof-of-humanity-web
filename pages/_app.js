import {
  AccountSettingsPopup,
  ArchonProvider,
  Layout,
  Link,
  List,
  ListItem,
  NextLink,
  RelayProvider,
  SocialIcons,
  ThemeProvider,
  Web3Provider,
  createWrapConnection,
  useWeb3,
} from "@kleros/components";
import { ProofOfHumanityLogo } from "@kleros/icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { indexQuery } from "_pages/index";
import { IdQuery } from "_pages/profile/[id]";
import { queryEnums } from "data";
import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import { address } from "subgraph/config/kovan";

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
    registered: "#009aff",
    removed: "#4a4a4a",
  },
};
const contracts = [
  { name: "proofOfHumanity", abi: ProofOfHumanity, address: { 42: address } },
];
function MyProfileLink() {
  const [accounts] = useWeb3("eth", "getAccounts");
  return accounts?.[0] ? (
    <NextLink href="/profile/[id]" as={`/profile/${accounts[0]}`}>
      <Link variant="navigation">My Profile</Link>
    </NextLink>
  ) : null;
}
const header = {
  left: (
    <>
      <ProofOfHumanityLogo size={32} />
      PROOF OF HUMANITY
    </>
  ),
  middle: (
    <List
      sx={{
        display: "flex",
        justifyContent: "space-around",
        listStyle: "none",
        width: "100%",
      }}
    >
      <ListItem>
        <NextLink href="/">
          <Link variant="navigation">Profiles</Link>
        </NextLink>
      </ListItem>
      <ListItem>
        <MyProfileLink />
      </ListItem>
    </List>
  ),
  right: <AccountSettingsPopup />,
};
const footer = {
  right: <SocialIcons />,
};
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
  return (
    <ThemeProvider theme={theme}>
      <RelayProvider
        endpoint={`https://api.thegraph.com/subgraphs/name/epiqueras/proof-of-humanity-${network}`}
        queries={queries}
        connectToRouteChange={connectToRouteChange}
      >
        <Web3Provider
          infuraURL={`wss://${network}.infura.io/ws/v3/dd555294ec53482f952f78d2d955c34d`}
          contracts={contracts}
        >
          <ArchonProvider>
            <Layout header={header} footer={footer}>
              <Component {...pageProps} />
            </Layout>
          </ArchonProvider>
        </Web3Provider>
      </RelayProvider>
    </ThemeProvider>
  );
}
