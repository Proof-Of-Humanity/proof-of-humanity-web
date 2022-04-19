import {
  AppFooter,
  AppHeader,
  ArchonProvider,
  Flex,
  RelayProvider,
  ThemeProvider,
  Web3Provider,
  createWrapConnection,
} from "@kleros/components";
import { Layout } from "antd";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { indexQuery } from "_pages/index";
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

import "i18n/i18n";

// CSS imports
// import 'antd/dist/antd.css';
import "./main.css";

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

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function App({ Component, pageProps }) {
  const { t } = useTranslation();

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

  if (
    (networkFromProvider &&
      networkFromProvider.name !== process.env.NEXT_PUBLIC_NETWORK) ||
    network !== process.env.NEXT_PUBLIC_NETWORK
  )
    return (
      <Flex
        sx={{
          alignItems: "center",
          height: "100vh",
          justifyContent: "center",
          width: "100vw",
        }}
      >
        {t("poh_unsupported_network", { network: capitalize(network) })}
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
            <Layout className="poh-layout">
              <AppHeader />
              <Content className="poh-content">
                <Component {...pageProps} />
              </Content>
              <AppFooter />
            </Layout>
          </ArchonProvider>
        </Web3Provider>
      </RelayProvider>
    </ThemeProvider>
  );
}
