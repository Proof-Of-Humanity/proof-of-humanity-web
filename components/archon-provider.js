import Archon from "@kleros/archon";
import Dataloader from "dataloader";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import usePromise from "react-use-promise";

import { useWeb3 } from "./web3-provider";

const Context = createContext();
const sanitize = (input) =>
  input
    .toString()
    .toLowerCase()
    .replace(/([^\d.a-z]+)/gi, "-"); // Only allow numbers and aplhanumeric.

export default function ArchonProvider({ children }) {
  const { web3 } = useWeb3();
  const [archon] = useState(
    () =>
      new Archon(
        web3.currentProvider,
        `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}`
      )
  );
  useEffect(() => {
    if (web3.currentProvider !== archon.arbitrable.web3.currentProvider)
      archon.setProvider(web3.currentProvider);
  }, [web3.currentProvider, archon]);

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          archon,
          upload(fileName, buffer, operation = "evidence") {
            const payload = new FormData();
            payload.append("file", new Blob([buffer]), sanitize(fileName));

            return fetch(
              `${process.env.NEXT_PUBLIC_COURT_FUNCTIONS_URL}/.netlify/functions/upload-to-ipfs?operation=${operation}&pinToGraph=false`,
              {
                method: "POST",
                body: payload,
              }
            )
              .then((res) => res.json())
              .then(
                ({ cids }) =>
                  new URL(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${cids[0]}`)
              );
          },
          uploadWithProgress(
            fileName,
            buffer,
            { onProgress = () => {} } = {},
            operation = "evidence"
          ) {
            const xhr = new XMLHttpRequest();

            let loadListener;
            let errorListener;

            const responsePromise = new Promise((resolve, reject) => {
              xhr.open(
                "POST",
                `${process.env.NEXT_PUBLIC_COURT_FUNCTIONS_URL}/.netlify/functions/upload-to-ipfs?operation=${operation}&pinToGraph=false`
              );

              loadListener = () => {
                resolve(xhr.response);
              };

              errorListener = () => {
                const err = new Error("Failed to submit the request");
                err.status = xhr.status;
                reject(err);
              };

              xhr.addEventListener("load", loadListener);
              xhr.addEventListener("error", errorListener);
            });

            xhr.upload.addEventListener("progress", onProgress);

            const payload = new FormData();
            payload.append("file", new Blob([buffer]), fileName);

            xhr.send(payload);

            const promise = Promise.resolve().then(() =>
              responsePromise
                .then((res) => JSON.parse(res))
                .then(
                  ({ cids }) =>
                    new URL(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${cids[0]}`)
                )
            );

            promise.then(() => {
              xhr.removeEventListener("load", loadListener);
              xhr.removeEventListener("error", errorListener);
              xhr.upload.removeEventListener("progress", onProgress);
            });

            return promise;
          },
        }),
        [archon]
      )}
    >
      {children}
    </Context.Provider>
  );
}

export function useArchon() {
  return useContext(Context);
}

export function createUseDataloaders(fetchers) {
  const dataloaders = Object.keys(fetchers).reduce((acc, name) => {
    acc[name] = new Dataloader(
      (argsArr) =>
        Promise.all(
          argsArr.map((args) => fetchers[name](...args).catch((err) => err))
        ),
      {
        cacheKeyFn([, ...args]) {
          return JSON.stringify(args);
        },
      }
    );
    return acc;
  }, {});

  return Object.keys(dataloaders).reduce((acc, name) => {
    acc[name] = function useDataloader() {
      const [state, setState] = useState({});
      const loadedRef = useRef({});
      const mountedRef = useRef({});
      useEffect(() => () => (mountedRef.current = false), []);

      const { web3 } = useWeb3();
      const { archon } = useArchon();
      return (...args) => {
        const key = JSON.stringify(args);
        const cacheResult = (res) => {
          if (mountedRef.current) {
            loadedRef.current[key] = true;
            setState((_state) => ({ ..._state, [key]: res }));
          }
        };
        return loadedRef.current[key]
          ? state[key]
          : dataloaders[name]
              .load([{ web3, archon }, ...args])
              .then(cacheResult, cacheResult) && undefined;
      };
    };
    return acc;
  }, {});
}

export function createDerivedAccountAPIs(APIDescriptors, userSettingsURL) {
  const APIs = APIDescriptors.reduce(
    (acc, { name, method, URL, payloadKey }) => {
      acc[name] = async (web3, payload) => {
        const [account] = await web3.eth.getAccounts();
        const derivedAccount = await web3.deriveAccount(
          "To keep your data safe and to use certain features, we ask that you sign this message to create a secret key for your account. This key is unrelated from your main Ethereum account and will not be able to send any transactions.",
          method !== "GET"
        );

        const fetcher = () =>
          fetch(URL, {
            method: method === "GET" ? "POST" : method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payload: {
                address: account,
                network: web3.ETHNet.name,
                signature: derivedAccount?.sign?.(JSON.stringify(payload))
                  .signature,
                [payloadKey]: payload,
              },
            }),
          }).then((res) => res.json());
        const res = await fetcher();

        if (res.error && derivedAccount) {
          const settings = {
            derivedAccountAddress: {
              S: derivedAccount.address,
            },
          };
          await fetch(userSettingsURL, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payload: {
                address: account,
                signature: await web3.eth.personal.sign(
                  JSON.stringify(settings),
                  account
                ),
                settings,
              },
            }),
          }).then((_res) => _res.json());

          return fetcher();
        }

        return res;
      };
      return acc;
    },
    {}
  );

  return {
    APIs,
    useAPIs: APIDescriptors.reduce((acc, { method, name }) => {
      acc[name] = function useAPI(payload) {
        const isGet = method === "GET";
        const { web3 } = useWeb3();
        const [promise, setPromise] = useState();
        const data = usePromise(
          () => (isGet ? APIs[name](web3, payload) : promise),
          [isGet, web3, payload, promise]
        );
        return isGet
          ? data
          : {
              send(_payload) {
                const _promise = APIs[name](web3, { payload, ..._payload });
                setPromise(_promise);
                return _promise;
              },
              data,
            };
      };
      return acc;
    }, {}),
  };
}
