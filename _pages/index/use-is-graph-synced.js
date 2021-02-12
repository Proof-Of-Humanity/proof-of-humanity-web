import { useEffect, useRef } from "react";
import { graphql, useQuery } from "relay-hooks";

export default function useIsGraphSynced(blockNumber, reloadWhenSynced) {
  const { error, retry, props } = useQuery(
    graphql`
      query useIsGraphSyncedQuery($blockNumber: Int!) {
        _meta(block: { number: $blockNumber }) {
          hasIndexingErrors
        }
      }
    `,
    { blockNumber },
    { fetchPolicy: "network-only", skip: !blockNumber }
  );

  const reloadWhenSyncedRef = useRef(reloadWhenSynced);
  useEffect(() => {
    if (reloadWhenSynced) reloadWhenSyncedRef.current = reloadWhenSynced;
  }, [reloadWhenSynced]);

  useEffect(() => {
    if (error) {
      let cancelled = false;
      setTimeout(() => !cancelled && retry(), 1000);
      return () => (cancelled = true);
    }
  }, [error, retry]);

  useEffect(() => {
    if (props && reloadWhenSyncedRef.current) location.reload();
  }, [props]);
  return Boolean(props) || !blockNumber;
}
