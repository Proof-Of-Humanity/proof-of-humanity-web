import {
  AccountSettingsPopup,
  ArchonProvider,
  Layout,
  Link,
  List,
  ListItem,
  RelayProvider,
  SocialIcons,
  ThemeProvider,
  Web3Provider,
} from "@kleros/components";
import { ProofOfHumanityLogo } from "@kleros/icons";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { homeQuery } from "./home";

import { queryEnums } from "data";

const theme = {
  colors: {
    vouching: "#4d00b4",
    pendingRegistration: "#ccc",
    pendingRemoval: "#ff9900",
    registered: "#009aff",
    removed: "#4a4a4a",
  },
};
const header = {
  left: (
    <>
      <ProofOfHumanityLogo size={32} />
      PROOF OF HUMANITY
    </>
  ),
  middle: (
    <List sx={{ listStyle: "none" }}>
      <ListItem>
        <NextLink href="/?network=kovan" passHref>
          <Link variant="navigation">Profiles</Link>
        </NextLink>
      </ListItem>
    </List>
  ),
  right: <AccountSettingsPopup />,
};
const footer = {
  right: <SocialIcons />,
};
const queries = {
  "/": homeQuery,
  "/home": homeQuery,
};
const createSubscribeToRouteChange = (router) => {
  const subscribeToRouteChange = (handleRouteChange) => {
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  };
  subscribeToRouteChange.router = router;
  return subscribeToRouteChange;
};
export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { network = "mainnet", ...query } = useMemo(
    () =>
      [...new URLSearchParams(router.asPath.split("?")[1]).entries()].reduce(
        (acc, [key, value]) => {
          const queryEnumQuery = queryEnums[key]?.[value]?.query;
          if (queryEnumQuery) acc = { ...acc, ...queryEnumQuery };
          else acc[key] = isNaN(value) ? value : Number(value);
          return acc;
        },
        {}
      ),
    [router.asPath]
  );
  const [subscribeToRouteChange, setSubscribeToRouteChange] = useState(() =>
    createSubscribeToRouteChange(router)
  );
  useEffect(() => {
    if (router && router !== subscribeToRouteChange.router)
      setSubscribeToRouteChange(createSubscribeToRouteChange(router));
  }, [router, subscribeToRouteChange.router]);
  return (
    <ThemeProvider theme={theme}>
      <RelayProvider
        endpoint={`https://api.thegraph.com/subgraphs/name/epiqueras/proof-of-humanity-${network}`}
        queries={queries}
        path={router.pathname}
        query={query}
        subscribeToRouteChange={subscribeToRouteChange}
      >
        <Web3Provider
          infuraURL={`wss://${network}.infura.io/ws/v3/dd555294ec53482f952f78d2d955c34d`}
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
