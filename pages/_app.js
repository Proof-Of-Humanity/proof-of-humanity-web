import {
  ArchonProvider,
  Box,
  Flex,
  Link,
  NextLink,
  RelayProvider,
  ThemeProvider,
  Web3Provider,
  AccountSettingsPopup as _AccountSettingsPopup,
  createWrapConnection,
  useWeb3,
  AppHeader,
  AppFooter
} from "@kleros/components";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { animated, useTransition } from "react-spring";
import { useQuery } from "relay-hooks";

import { indexQuery } from "_pages/index";
import { appQuery } from "_pages/index/app-query";
import { IdQuery } from "_pages/profile/[id]";
import { queryEnums } from "data";
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

import { Layout } from 'antd';

// CSS imports
import 'antd/dist/antd.css';
import './main.css';

const { Content } = Layout;

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

  return (
    <ThemeProvider theme={theme}>
      <RelayProvider endpoint={endpoint} queries={queries} connectToRouteChange={connectToRouteChange}>
        <Web3Provider infuraURL={process.env.NEXT_PUBLIC_INFURA_ENDPOINT} contracts={contracts} onNetworkChange={onNetworkChange}>
          <ArchonProvider>
            <Layout>
              <AppHeader />
              <Content>
                {transitions.map(({ key, props, item }) => {
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
              </Content>
              <AppFooter />
            </Layout>
          </ArchonProvider>
        </Web3Provider>
      </RelayProvider>
    </ThemeProvider>
  );
}
