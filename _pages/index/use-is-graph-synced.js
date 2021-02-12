import { useRefetchQuery } from "@kleros/components";
import { useEffect } from "react";
import { graphql, useQuery } from "relay-hooks";

export default function useIsGraphSynced(blockNumber) {
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

  useEffect(() => {
    if (error) {
      let cancelled = false;
      setTimeout(() => !cancelled && retry(), 1000);
      return () => (cancelled = true);
    }
  }, [error, retry]);

  const refetchQuery = useRefetchQuery();
  useEffect(() => {
    if (refetchQuery) refetchQuery(blockNumber);
  }, [props, refetchQuery, blockNumber]);

  return Boolean(props) || !blockNumber;
}
