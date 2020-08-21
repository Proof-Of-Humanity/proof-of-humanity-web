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

const newEnvironment = (endpoint) => {
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
  path,
  query,
  subscribeToRouteChange,
  children,
}) {
  const [prefetch] = useState(loadQuery);
  const [initialized, setInitialized] = useState(false);

  const [environment, setEnvironment] = useState(() =>
    newEnvironment(endpoint)
  );
  useEffect(() => {
    if (endpoint !== environment.endpoint)
      setEnvironment(newEnvironment(endpoint));
  }, [endpoint, environment]);

  useEffect(() => {
    if (environment) {
      prefetch.next(environment, queries[path], query);
      setInitialized(true);

      return subscribeToRouteChange((newPath) =>
        prefetch.next(environment, queries[newPath], query)
      );
    }
  }, [environment, prefetch, queries, path, query, subscribeToRouteChange]);
  return initialized ? (
    <RelayEnvironmentProvider environment={environment}>
      <Context.Provider value={prefetch}>{children}</Context.Provider>
    </RelayEnvironmentProvider>
  ) : (
    "Connecting to The Graph node..."
  );
}

export function useQuery() {
  return usePreloadedQuery(useContext(Context));
}
