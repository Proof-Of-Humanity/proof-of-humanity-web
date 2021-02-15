import {
  Box,
  Button,
  Popup,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { Warning } from "@kleros/icons";
import { useMemo } from "react";

import useIsGraphSynced from "_pages/index/use-is-graph-synced";

export default function VouchButton({ submissionID }) {
  const [accounts] = useWeb3("eth", "getAccounts");
  const [registered] = useContract(
    "proofOfHumanity",
    "isRegistered",
    useMemo(() => ({ args: [accounts?.[0]] }), [accounts])
  );
  const [vouched, , status, reCall] = useContract(
    "proofOfHumanity",
    "vouches",
    useMemo(() => ({ args: [accounts?.[0], submissionID] }), [
      accounts,
      submissionID,
    ])
  );
  const { receipt, send, loading } = useContract(
    "proofOfHumanity",
    vouched ? "removeVouch" : "addVouch"
  );
  const isGraphSynced = useIsGraphSynced(receipt?.blockNumber);
  const text = `${vouched ? "Remove " : ""}Vouch`;
  return registered ? (
    <Popup
      trigger={
        <Button
          sx={{
            marginY: 2,
            width: "100%",
          }}
          disabled={
            status === "pending" ||
            accounts?.[0]?.toLowerCase() === submissionID.toLowerCase()
          }
          loading={!isGraphSynced}
        >
          {text}
        </Button>
      }
      modal
    >
      {(close) => (
        <Box sx={{ padding: 2 }}>
          <Warning />
          <Text sx={{ marginBottom: 2 }}>
            Make sure the person exists and that you have physically encountered
            them. Note that in the case of a dispute, if a submission is
            rejected for reason “Duplicate” or “Does not exist”, everyone who
            had vouched for it will get removed from the registry. Note that
            your vouch will only be counted when and as long as you are
            registered, and another submission is not using your vouch.
          </Text>
          <Button
            onClick={() =>
              send(submissionID)
                .then(reCall)
                .then(() => close())
            }
            loading={loading}
          >
            {text}
          </Button>
        </Box>
      )}
    </Popup>
  ) : null;
}
