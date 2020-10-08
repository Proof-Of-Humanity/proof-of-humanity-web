import {
  Box,
  Button,
  Card,
  Popup,
  Text,
  useContract,
  useWeb3,
  zeroAddress,
} from "@kleros/components";
import { useMemo } from "react";
import { graphql, useFragment } from "relay-hooks";

const removeButtonFragments = {
  contract: graphql`
    fragment removeButtonContract on Contract {
      submissionBaseDeposit
      sharedStakeMultiplier
    }
  `,
  request: graphql`
    fragment removeButtonRequest on Request {
      arbitrator
      arbitratorExtraData
    }
  `,
};
export default function RemoveButton({ request, contract, submissionID }) {
  const { arbitrator, arbitratorExtraData } = useFragment(
    removeButtonFragments.request,
    request
  );
  const [arbitrationCost] = useContract(
    "klerosLiquid",
    "arbitrationCost",
    useMemo(
      () => ({
        address: arbitrator,
        args: [arbitratorExtraData],
      }),
      [arbitrator, arbitratorExtraData]
    )
  );
  const { web3 } = useWeb3();
  const { sharedStakeMultiplier, submissionBaseDeposit } = useFragment(
    removeButtonFragments.contract,
    contract
  );
  const totalCost = arbitrationCost
    ?.add(
      arbitrationCost
        .mul(web3.utils.toBN(sharedStakeMultiplier))
        .div(web3.utils.toBN(10000))
    )
    .add(web3.utils.toBN(submissionBaseDeposit));
  const { send, loading } = useContract("proofOfHumanity", "removeSubmission");
  return (
    <Popup
      trigger={
        <Button
          sx={{
            marginY: 1,
            width: "100%",
          }}
        >
          Request Removal
        </Button>
      }
      modal
    >
      {(close) => (
        <Box sx={{ fontWeight: "bold", padding: 2 }}>
          <Text sx={{ marginBottom: 1 }}>Deposit:</Text>
          <Card
            variant="muted"
            sx={{ fontSize: 2, marginBottom: 3 }}
            mainSx={{ padding: 0 }}
          >
            <Text>
              {totalCost && `${web3.utils.fromWei(totalCost)} ETH Deposit`}
            </Text>
          </Card>
          <Button
            sx={{ display: "block", margin: "auto" }}
            disabled={!totalCost}
            onClick={() =>
              send(submissionID, zeroAddress, { value: totalCost }).then(() =>
                close()
              )
            }
            loading={loading}
          >
            Request Removal
          </Button>
        </Box>
      )}
    </Popup>
  );
}
