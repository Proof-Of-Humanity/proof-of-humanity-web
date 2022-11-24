import { Global } from "@emotion/core";
import WalletConnectWeb3Provider from "@walletconnect/web3-provider";
import Authereum from "authereum";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useStorageReducer } from "react-storage-hooks";
import usePromise from "react-use-promise";
import Web3 from "web3";
import Web3Modal from "web3modal";

const deriveAccount = async function (message, create = true) {
  const [account] = await this.eth.getAccounts();
  const storageKey = `${account}-${message}`;

  let secret = localStorage.getItem(storageKey);
  if (secret === null) {
    if (!create) {
      return secret;
    }
    secret = await this.eth.personal.sign(message, account);
    localStorage.setItem(storageKey, secret);
  }

  return this.eth.accounts.privateKeyToAccount(this.utils.keccak256(secret));
};

export const createWeb3 = (infuraURL, t) => {
  const web3 = new Web3(infuraURL);
  web3.modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      injected: {
        display: {
          description: t("web3_modal_metamask"),
        },
      },
      walletconnect: {
        display: {
          description: t("web3_modal_walletconnect"),
        },
        package: WalletConnectWeb3Provider,
        options: {
          infuraId: infuraURL.slice(infuraURL.lastIndexOf("/") + 1),
        },
      },
      authereum: {
        display: {
          description: t("web3_modal_authereum"),
        },
        package: Authereum,
      },
    },
  });
  web3.infuraURL = infuraURL;
  web3.deriveAccount = deriveAccount;
  return web3;
};
export const createWeb3FromModal = async (modal, infuraURL) => {
  const web3 = new Web3(await modal.connect());
  web3.modal = modal;
  web3.infuraURL = infuraURL;
  web3.deriveAccount = deriveAccount;
  return web3;
};

const Context = createContext();

export default function Web3Provider({
  infuraURL,
  contracts,
  onNetworkChange,
  children,
}) {
  const { t } = useTranslation();
  const [web3, setWeb3] = useState(() => createWeb3(infuraURL, t));

  useEffect(() => {
    if (infuraURL !== web3.infuraURL) {
      setWeb3(createWeb3(infuraURL, t));
    }
  }, [infuraURL, web3.infuraURL, t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (web3.modal.cachedProvider) {
        const _web3 = await createWeb3FromModal(web3.modal, web3.infuraURL);
        if (!cancelled) {
          setWeb3(_web3);
        }
      }
    })();

    if (window.ethereum) {
      const listener = async () => {
        setWeb3(await createWeb3FromModal(web3.modal, web3.infuraURL));
      };
      window.ethereum.on("accountsChanged", listener);
      return () => {
        cancelled = true;
        window.ethereum.removeListener("accountsChanged", listener);
      };
    }
    return () => (cancelled = true);
  }, [web3.modal, web3.infuraURL]);

  // Instantiate contracts.
  useEffect(() => {
    let cancelled = false;
    const networkIdToName = {
      1: "mainnet",
      5: "goerli",
    };
    (async () => {
      const ETHNetID = await web3.eth.net.getId();
      if (!cancelled && ETHNetID !== web3.ETHNet?.ID) {
        web3.ETHNet = {
          ID: ETHNetID,
          name: { 1: "mainnet", 5: "goerli" }[ETHNetID],
        };
        setWeb3({ ...web3 });
        if (onNetworkChange) {
          onNetworkChange(web3.ETHNet);
        }
      }

      if (networkIdToName[ETHNetID] !== process.env.NEXT_PUBLIC_NETWORK) {
        return;
      }

      if (contracts !== web3._contracts) {
        const [account] = await web3.eth.getAccounts();
        if (!cancelled) {
          web3.contracts = contracts.reduce(
            (acc, { name, abi, address, options }) => {
              acc[name] = new web3.eth.Contract(
                abi,
                address[web3.ETHNet.name],
                {
                  from: account,
                  ...options,
                }
              );
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
          setWeb3({ ...web3 });
        }
      }
    })();
    return () => (cancelled = true);
  }, [web3, onNetworkChange, contracts]);
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
      <Global styles={{ ".web3modal-modal-lightbox": { zIndex: 1000 } }} />
      {children}
    </Context.Provider>
  );
}

export function useWeb3Context() {
  return useContext(Context);
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

const parseRes = (value, web3) =>
  typeof value === "boolean" ||
  Number.isNaN(Number(value)) ||
  value.startsWith("0x")
    ? value
    : web3.utils.toBN(value);

export function useContract(
  contract,
  method,
  { address, type, args, options } = {}
) {
  const { web3, connect } = useWeb3();
  const contractName = contract;
  contract = useMemo(() => {
    let _contract = web3.contracts?.[contract];
    if (_contract && address && _contract.options.address !== address) {
      const jsonInterfaceMap = _contract.jsonInterfaceMap;
      _contract = _contract.clone();
      _contract.options.address = address;
      _contract.jsonInterfaceMap = jsonInterfaceMap;
    }
    return _contract;
  }, [web3.contracts, contract, address]);
  type =
    type ||
    (contract &&
      method &&
      (contract.jsonInterfaceMap[method].constant ? "call" : "send"));

  const run = useCallback(
    (_args, _options) =>
      contract &&
      method &&
      (!args ||
        args.findIndex((value) => value === undefined || value === null) ===
          -1) &&
      contract.methods[method](...(args || []), ...(_args || []))[type]({
        ...options,
        ..._options,
      }),
    [contract, method, args, type, options]
  );
  const isSend = type === "send";

  const [sendState, dispatch] = useStorageReducer(
    localStorage,
    JSON.stringify({ contract: contractName, method, type }),
    sendStateReducer,
    {}
  );
  const send = useCallback(
    async (...__args) => {
      if (!contract.options.from) {
        await connect();
      }

      let _args;
      let _options;
      if (
        typeof __args[__args.length - 1] === "object" &&
        !Array.isArray(__args[__args.length - 1])
      ) {
        _args = __args.slice(0, -1);
        _options = __args[__args.length - 1];
      } else {
        _args = __args;
      }
      return new Promise((resolve, reject) =>
        run(_args, _options)
          .on("transactionHash", (transactionHash) =>
            dispatch({ type: "transactionHash", transactionHash })
          )
          .on("confirmation", (confirmation) =>
            dispatch({ type: "confirmation", confirmation })
          )
          .on("receipt", (receipt) => {
            dispatch({ type: "receipt", receipt });
            resolve(receipt);
          })
          .on("error", (error) => {
            dispatch({ type: "error", error });
            reject(error);
          })
      );
    },
    [contract, connect, run, dispatch]
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
          if (_receipt) {
            resolve(_receipt);
          } else {
            setTimeout(poll, 2000);
          }
        };
        poll();
      }),
    [sendState.transactionHash, sendState.receipt, web3]
  );

  const [reCallRef, reCall] = useReducer(() => ({}), {});
  const data = usePromise(
    () =>
      reCallRef &&
      type &&
      !isSend &&
      run().then?.((res) =>
        typeof res === "object"
          ? Object.keys(res).reduce((acc, key) => {
              acc[key] = parseRes(res[key], web3);
              return acc;
            }, {})
          : parseRes(res, web3)
      ),
    [reCallRef, type, isSend, run, web3]
  );

  return isSend
    ? {
        receipt,
        ...sendState,
        send,
        loading:
          sendState.transactionHash &&
          !sendState.receipt &&
          !receipt &&
          !sendState.error,
      }
    : [...data, reCall];
}
