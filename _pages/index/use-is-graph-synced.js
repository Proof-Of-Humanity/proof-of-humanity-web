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
    reloadWhenSyncedRef.current = reloadWhenSynced;
  }, [reloadWhenSynced]);

  const reloadWhenSyncedWorkingRef = useRef(false);
  useEffect(() => {
    if (error) {
      // Only update `reloadWhenSynced` when we fall out of sync.
      reloadWhenSyncedWorkingRef.current = reloadWhenSyncedRef.current;
      let cancelled = false;
      setTimeout(() => !cancelled && retry(), 1000);
      return () => (cancelled = true);
    }
  }, [error, retry]);

  useEffect(() => {
    if (props && reloadWhenSyncedWorkingRef.current) location.reload();
  }, [props]);

  return Boolean(props) || !blockNumber;
}
