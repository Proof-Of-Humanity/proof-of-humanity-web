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

export default function VouchButton({ submissionID }) {
  const [accounts] = useWeb3("eth", "getAccounts");
  const [vouched, , status, reCall] = useContract(
    "proofOfHumanity",
    "vouches",
    useMemo(() => ({ args: [accounts?.[0], submissionID] }), [
      accounts,
      submissionID,
    ])
  );
  const { send, loading } = useContract(
    "proofOfHumanity",
    vouched ? "removeVouch" : "addVouch"
  );
  const text = `${vouched ? "Remove " : ""}Vouch`;
  return (
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
            had vouched for it will get removed from the registry.
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
  );
}
