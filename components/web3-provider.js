import UniLoginProvider from "@unilogin/provider";
import WalletConnectWeb3Provider from "@walletconnect/web3-provider";
import Authereum from "authereum";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import usePromise from "react-use-promise";
import Web3 from "web3";
import Web3Modal from "web3modal";

const newWeb3 = (infuraURL) => {
  const web3 = new Web3(infuraURL);
  web3.infuraURL = infuraURL;
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
  return web3;
};
const Context = createContext();
export default function Web3Provider({ infuraURL, children }) {
  const [web3, setWeb3] = useState(() => newWeb3(infuraURL));
  useEffect(() => {
    if (infuraURL !== web3.infuraURL) setWeb3(newWeb3(infuraURL));
  }, [infuraURL, web3.infuraURL]);
  useEffect(() => {
    (async () => {
      if (web3.modal.cachedProvider) {
        const _web3 = new Web3(await web3.modal.connect());
        _web3.infuraURL = web3.infuraURL;
        _web3.modal = web3.modal;
        setWeb3(_web3);
      }
    })();
  }, [web3.infuraURL, web3.modal]);
  return (
    <Context.Provider
      value={useMemo(
        () => ({
          web3,
          setWeb3,
          async connect() {
            web3.modal.clearCachedProvider();
            const _web3 = new Web3(await web3.modal.connect());
            _web3.infuraURL = web3.infuraURL;
            _web3.modal = web3.modal;
            setWeb3(_web3);
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
