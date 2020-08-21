import Archon from "@kleros/archon";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
