import UniLoginProvider from "@unilogin/provider";
import WalletConnectWeb3Provider from "@walletconnect/web3-provider";
import Authereum from "authereum";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import usePromise from "react-promise";
import Web3 from "web3";
import Web3Modal from "web3modal";

const Context = createContext();
export default function Web3Provider({ infuraURL, children }) {
  const [web3, setWeb3] = useState(() => {
    const _web3 = new Web3(infuraURL);
    _web3.infuraURL = infuraURL;
    return _web3;
  });
  useEffect(() => {
    if (infuraURL !== web3.infuraURL && !web3.isCustom) {
      const _web3 = new Web3(infuraURL);
      _web3.infuraURL = infuraURL;
      setWeb3(_web3);
    }
  }, [infuraURL, web3]);
  return (
    <Context.Provider
      value={useMemo(
        () => ({
          web3,
          setWeb3,
          async connect() {
            const infuraId = infuraURL.slice(infuraURL.lastIndexOf("/") + 1);
            const provider = await new Web3Modal({
              providerOptions: {
                walletconnect: {
                  package: WalletConnectWeb3Provider,
                  options: {
                    infuraId,
                  },
                },
                authereum: {
                  package: Authereum,
                },
                unilogin: {
                  package: UniLoginProvider,
                },
              },
            }).connect();
            const _web3 = new Web3(provider);
            _web3.isCustom = true;
            setWeb3(_web3);
          },
        }),
        [web3, setWeb3, infuraURL]
      )}
    >
      {children}
    </Context.Provider>
  );
}

const noOpPromise = Promise.resolve();
export function useWeb3(namespace, method, args) {
  const isNotCall = !namespace || !method;

  const web3Context = useContext(Context);
  const promise = useMemo(
    () =>
      !isNotCall &&
      [...namespace.split("."), method].reduce(
        (acc, key) => acc[key],
        web3Context.web3
      )(...(args || [])),
    [isNotCall, namespace, method, web3Context, args]
  );
  const data = usePromise(isNotCall ? noOpPromise : promise);

  return isNotCall ? web3Context : data;
}
