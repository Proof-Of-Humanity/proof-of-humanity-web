import {
  Box,
  Button,
  Popup,
  Text,
  useContract,
  useWeb3,
  useWeb3Context,
} from "@kleros/components";
import { Warning } from "@kleros/icons";
import { useCallback, useMemo, useState } from "react";

import { address as pohAddress } from "subgraph/config";

const vouchText = `
Make sure the person exists and that you have physically encountered
them. Note that in the case of a dispute, if a submission is
rejected for reason “Duplicate” or “Does not exist”, everyone who
had vouched for it will get removed from the registry. Note that
your vouch will only be counted when and as long as you are
registered, and another submission is not using your vouch.
`;

export default function GasslessVouchButton({ submissionID }) {
  const web3Context = useWeb3Context();
  const [accounts] = useWeb3("eth", "getAccounts");
  const [addVouchLabel, setAddVouchLabel] = useState(vouchText);
  const [registered] = useContract(
    "proofOfHumanity",
    "isRegistered",
    useMemo(() => ({ args: [accounts?.[0]] }), [accounts])
  );
  const [vouched] = useContract(
    "proofOfHumanity",
    "vouches",
    useMemo(
      () => ({ args: [accounts?.[0], submissionID] }),
      [accounts, submissionID]
    )
  );
  const signVouch = useCallback(async () => {
    if (!web3Context) return;

    const { connect, web3 } = web3Context;
    if (!accounts?.[0]) {
      await connect();
      return;
    }
    const chainId = await web3.eth.net.getId();

    const messageParameters = JSON.stringify({
      domain: {
        chainId,
        name: "Proof of Humanity",
        verifyingContract: pohAddress,
      },
      message: {
        vouchedSubmission: submissionID,
        voucherExpirationTimestamp:
          Math.floor(Date.now() / 1000) + 6 * 30 * 24 * 60 * 60, // Expire in about ~6 months.
      },
      primaryType: "IsHumanVoucher",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        IsHumanVoucher: [
          { name: "vouchedSubmission", type: "address" },
          { name: "voucherExpirationTimestamp", type: "uint256" },
        ],
      },
    });

    const from = accounts?.[0];
    const parameters = [from, messageParameters];
    const method = "eth_signTypedData_v4";

    const promiseRequestSignature = () =>
      new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync(
          {
            method,
            params: parameters,
            from,
          },
          (err, result) => {
            if (err) return reject(err);

            return resolve(result);
          }
        );
      });

    const result = await promiseRequestSignature();
    const signature = result.result;

    return fetch(`${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature,
        msgData: messageParameters,
        voucherAddress: from,
      }),
    });
  }, [accounts, submissionID, web3Context]);
  return registered || vouched ? (
    <Popup
      trigger={
        <Button
          sx={{
            marginTop: 2,
            marginBottom: 0,
            width: "100%",
            backgroundImage:
              "linear-gradient(90deg,var(--theme-ui-colors-primary,#007cff) 0%,var(--theme-ui-colors-secondary,#00b7ff) 100%)",
          }}
        >
          {vouched ? "Remove" : "Gasless"} Vouch
        </Button>
      }
      modal
    >
      {(close) => (
        <Box sx={{ padding: 2 }}>
          <Warning />
          <Text sx={{ marginBottom: 2 }}>{addVouchLabel}</Text>
          {addVouchLabel !== "Vouch saved successfully." && (
            <Button
              onClick={() => {
                signVouch().then(() => {
                  setAddVouchLabel("Vouch saved successfully.");
                  setTimeout(close, 3000);
                });
              }}
            >
              Gasless Vouch
            </Button>
          )}
        </Box>
      )}
    </Popup>
  ) : null;
}
