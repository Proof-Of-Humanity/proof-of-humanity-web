import { useArchon } from "@kleros/components";
import Dataloader from "dataloader";
import { useEffect, useRef, useState } from "react";

const fetchers = {
  async getEvidenceFile(archon, URI) {
    const fetchFile = (_URI) =>
      archon.utils
        .validateFileFromURI(archon.arbitrable.ipfsGateway + _URI, {
          preValidated: true,
        })
        .then((res) => res.file);
    const file = await fetchFile(URI);
    const nestedFile = await fetchFile(file.fileURI);
    return {
      ...file,
      file: Object.keys(nestedFile).reduce((acc, key) => {
        if (acc[key].startsWith("/ipfs/"))
          acc[key] = archon.arbitrable.ipfsGateway + acc[key];
        return acc;
      }, nestedFile),
    };
  },
};
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
const { getEvidenceFile: useEvidenceFile } = Object.keys(dataloaders).reduce(
  (acc, name) => {
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
  },
  {}
);
export { useEvidenceFile };
