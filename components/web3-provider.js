import UniLoginProvider from "@unilogin/provider";
import WalletConnectWeb3Provider from "@walletconnect/web3-provider";
import Authereum from "authereum";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import usePromise from "react-use-promise";
import Web3 from "web3";
import Web3Modal from "web3modal";

const createWeb3 = (infuraURL) => {
  const web3 = new Web3(infuraURL);
  web3.modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectWeb3Provider,
        options: {
          infuraId: infuraURL.slice(infuraURL.lastIndexOf("/") + 1),
        },
      },
      authereum: {
        package: Authereum,
      },
      unilogin: {
        package: UniLoginProvider,
      },
    },
  });
  web3.infuraURL = infuraURL;
  return web3;
};
const createWeb3FromModal = async (modal, infuraURL) => {
  const web3 = new Web3(await modal.connect());
  web3.modal = modal;
  web3.infuraURL = infuraURL;
  return web3;
};
const Context = createContext();
export default function Web3Provider({ infuraURL, contracts, children }) {
  const [web3, setWeb3] = useState(() => createWeb3(infuraURL));
  useEffect(() => {
    if (infuraURL !== web3.infuraURL) setWeb3(createWeb3(infuraURL));
  }, [infuraURL, web3.infuraURL]);
  useEffect(() => {
    (async () => {
      if (web3.modal.cachedProvider)
        setWeb3(await createWeb3FromModal(web3.modal, web3.infuraURL));
    })();
  }, [web3.modal, web3.infuraURL]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (contracts !== web3._contracts) {
        const ETHNetID = await web3.eth.net.getId();
        if (!cancelled) {
          web3.contracts = contracts.reduce(
            (acc, { name, abi, address, options }) => {
              acc[name] = new web3.eth.Contract(
                abi,
                address[ETHNetID],
                options
              );
              return acc;
            },
            {}
          );
          web3._contracts = contracts;
        }
      }
    })();
    return () => (cancelled = true);
  }, [contracts, web3]);
  return (
    <Context.Provider
      value={useMemo(
        () => ({
          web3,
          setWeb3,
          async connect() {
            web3.modal.clearCachedProvider();
            setWeb3(await createWeb3FromModal(web3.modal, web3.infuraURL));
          },
        }),
        [web3, setWeb3]
      )}
    >
      {children}
    </Context.Provider>
  );
}

export function useWeb3(namespace, method, args) {
  const isNotCall = !namespace || !method;

  const web3Context = useContext(Context);
  const data = usePromise(
    () =>
      !isNotCall &&
      [...namespace.split("."), method].reduce(
        (acc, key) => acc[key],
        web3Context.web3
      )(...(args || [])),
    [isNotCall, namespace, method, web3Context, args]
  );

  return isNotCall ? web3Context : data;
}
