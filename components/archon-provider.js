import { Buffer } from "buffer";

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

import { useWeb3 } from "./web3-provider";

const Context = createContext();
export default function ArchonProvider({ children }) {
  const { web3 } = useWeb3();
  const [archon] = useState(
    () => new Archon(web3.currentProvider, "https://ipfs.kleros.io")
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
          upload(fileName, buffer) {
            return fetch("https://ipfs.kleros.io/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fileName,
                buffer: Buffer.from(buffer),
              }),
            })
              .then((res) => res.json())
              .then(
                ({ data }) =>
                  new URL(
                    `https://ipfs.kleros.io/ipfs/${data[1].hash}${data[0].path}`
                  )
              );
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
              .load([archon, ...args])
              .then(cacheResult, cacheResult) && undefined;
      };
    };
    return acc;
  }, {});
}
