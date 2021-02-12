import { createContext, useContext, useEffect, useState } from "react";
import {
  RelayNetworkLayer,
  cacheMiddleware,
  retryMiddleware,
  urlMiddleware,
} from "react-relay-network-modern";
import {
  RelayEnvironmentProvider,
  loadQuery,
  usePreloadedQuery,
} from "relay-hooks";
import { Environment, RecordSource, Store } from "relay-runtime";
import { Flex } from "theme-ui";

const createEnvironment = (endpoint) => {
  const environment = new Environment({
    network: new RelayNetworkLayer([
      cacheMiddleware(),
      urlMiddleware({
        url: endpoint,
      }),
      retryMiddleware(),
    ]),
    store: new Store(new RecordSource()),
  });
  environment.endpoint = endpoint;
  return environment;
};
const Context = createContext();
export default function RelayProvider({
  endpoint,
  queries,
  connectToRouteChange,
  children,
}) {
  const [prefetch] = useState(loadQuery);
  const [initialized, setInitialized] = useState(false);

  const [environment, setEnvironment] = useState(() =>
    createEnvironment(endpoint)
  );
  useEffect(() => {
    if (endpoint !== environment.endpoint)
      setEnvironment(createEnvironment(endpoint));
  }, [endpoint, environment]);

  useEffect(() => {
    if (environment) {
      connectToRouteChange((path, query) => {
        if (queries[path]) {
          prefetch.next(environment, queries[path], query);
          const refetchedKeys = {};
          prefetch.refetchQuery = (fetchKey) => {
            refetchedKeys[fetchKey] = true;
            prefetch.next(environment, queries[path], query, {
              fetchPolicy: "network-only",
              fetchKey: Object.keys(refetchedKeys).length,
            });
          };
        }
      });
      setInitialized(true);
    }
  }, [environment, connectToRouteChange, queries, prefetch]);
  return initialized ? (
    <RelayEnvironmentProvider environment={environment}>
      <Context.Provider value={prefetch}>{children}</Context.Provider>
    </RelayEnvironmentProvider>
  ) : (
    <Flex
      sx={{
        alignItems: "center",
        height: "100vh",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      Connecting to The Graph node...
    </Flex>
  );
}

export function useQuery() {
  return usePreloadedQuery(useContext(Context));
}

export function useRefetchQuery() {
  return useContext(Context).refetchQuery;
}
