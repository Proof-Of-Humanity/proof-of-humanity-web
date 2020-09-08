import UniLoginProvider from "@unilogin/provider";
import WalletConnectWeb3Provider from "@walletconnect/web3-provider";
import Authereum from "authereum";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useStorageReducer } from "react-storage-hooks";
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
        const [ETHNetID, accounts] = await Promise.all([
          web3.eth.net.getId(),
          web3.eth.getAccounts(),
        ]);
        if (!cancelled) {
          web3.contracts = contracts.reduce(
            (acc, { name, abi, address, options }) => {
              acc[name] = new web3.eth.Contract(abi, address[ETHNetID], {
                from: accounts[0],
                ...options,
              });
              acc[name].jsonInterfaceMap = acc[name]._jsonInterface.reduce(
                (_acc, method) => {
                  _acc[method.name] = method;
                  return _acc;
                },
                {}
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

const sendStateReducer = (
  state,
  { type, transactionHash, confirmation, receipt, error }
) => {
  switch (type) {
    case "transactionHash":
      return { transactionHash };
    case "confirmation":
      return { ...state, confirmation };
    case "receipt":
      return { ...state, receipt };
    case "error":
      return { ...state, error };
  }
};
export function useContract(contract, method, { args, type, options } = {}) {
  const { web3 } = useWeb3();
  type =
    type ||
    (web3.contracts[contract].jsonInterfaceMap[method].constant
      ? "call"
      : "send");
  const run = useCallback(
    (_args, _options) =>
      web3.contracts[contract].methods[method](...(args || []), ..._args)[
        type
      ]({ ...options, ..._options }),
    [web3.contracts, contract, method, args, type, options]
  );
  const isSend = type === "send";

  const [sendState, dispatch] = useStorageReducer(
    localStorage,
    JSON.stringify({ contract, method, type }),
    sendStateReducer,
    {}
  );
  const send = useCallback(
    (...__args) => {
      let _args;
      let _options;
      if (typeof __args[__args.length - 1] === "object") {
        _args = __args.slice(0, -1);
        _options = __args[__args.length - 1];
      } else _args = __args;
      run(_args, _options)
        .on("transactionHash", (transactionHash) =>
          dispatch({ type: "transactionHash", transactionHash })
        )
        .on("confirmation", (confirmation) =>
          dispatch({ type: "confirmation", confirmation })
        )
        .on("receipt", (receipt) => dispatch({ type: "receipt", receipt }))
        .on("error", (error) => dispatch({ type: "error", error }));
    },
    [run, dispatch]
  );
  const [receipt] = usePromise(
    () =>
      sendState.transactionHash &&
      !sendState.receipt &&
      new Promise((resolve) => {
        const poll = async () => {
          const _receipt = await web3.eth.getTransactionReceipt(
            sendState.transactionHash
          );
          if (_receipt) resolve(_receipt);
          else setTimeout(poll, 2000);
        };
        poll();
      }),
    [sendState.transactionHash, sendState.receipt, web3]
  );
  const data = usePromise(() => !isSend && run(), [isSend, run]);

  return isSend
    ? {
        receipt,
        ...sendState,
        send,
        loading: sendState.transactionHash && !sendState.receipt && !receipt,
      }
    : data;
}
