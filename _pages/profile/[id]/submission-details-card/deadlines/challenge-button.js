import {
  Box,
  Button,
  Card,
  Grid,
  Image,
  Input,
  Link,
  NextLink,
  Popup,
  Text,
  ethereumAddressRegExp,
  useContract,
  useWeb3,
  zeroAddress,
} from "@kleros/components";
import { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "relay-hooks";

import useIsGraphSynced from "_pages/index/use-is-graph-synced";
import {
  challengeReasonEnum,
  submissionStatusEnum,
  useEvidenceFile,
} from "data";

const challengeButtonFragments = {
  contract: graphql`
    fragment challengeButtonContract on Contract {
      submissionChallengeBaseDeposit
      sharedStakeMultiplier
    }
  `,
  request: graphql`
    fragment challengeButtonRequest on Request {
      disputed
      arbitrator
      arbitratorExtraData
      usedReasons
      currentReason
      metaEvidence {
        URI
      }
    }
  `,
};
function ChallengeTypeCard({ type, setType, currentType, ...rest }) {
  const { imageSrc, startCase, description } = type;
  return (
    <Card
      variant="muted"
      sx={{ width: 182 }}
      mainSx={{ flexDirection: "column", padding: 0 }}
      onClick={() => setType(type)}
      active={type === currentType}
      {...rest}
    >
      <Image sx={{ marginBottom: 2 }} src={imageSrc} />
      <Text sx={{ marginBottom: 2 }}>{startCase}</Text>
      <Text sx={{ fontWeight: "body" }}>{description}</Text>
    </Card>
  );
}
function DuplicateInput({ submissionID, setDuplicate }) {
  const [value, setValue] = useState("");
  const isValidAddress = ethereumAddressRegExp.test(value);
  const [submission] = useContract(
    "proofOfHumanity",
    "getSubmissionInfo",
    useMemo(
      () => ({
        args: [isValidAddress ? value : undefined],
      }),
      [isValidAddress, value]
    )
  );

  let message;
  if (submissionID.toLowerCase() === value.toLowerCase())
    message = "A submission can not be a duplicate of itself.";
  else if (isValidAddress && submission)
    if (Number(submission.status) > 0 || submission.registered)
      message = "Valid duplicate.";
    else
      message =
        "A supposed duplicate should be either registered or pending registration.";
  useEffect(() => {
    if (message === "Valid duplicate.") setDuplicate(value);
    else setDuplicate();
  }, [message, setDuplicate, value]);
  return (
    <Box sx={{ marginBottom: 2 }}>
      <Input
        sx={{ marginBottom: 1 }}
        placeholder="Duplicate Address"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Text>{message}</Text>
      {isValidAddress && (
        <NextLink href="/profile/[id]" as={`/profile/${value}`}>
          <Link newTab>See Profile</Link>
        </NextLink>
      )}
    </Box>
  );
}
export default function ChallengeButton({
  request,
  contract,
  status,
  submissionID,
}) {
  const {
    metaEvidence: _metaEvidence,
    currentReason: _currentReason,
    arbitrator,
    arbitratorExtraData,
    disputed,
    usedReasons: _usedReasons,
  } = useFragment(challengeButtonFragments.request, request);
  const currentReason = challengeReasonEnum.parse(_currentReason);
  const usedReasons = challengeReasonEnum.parse(_usedReasons);
  const currentReasonIsNotDuplicate =
    currentReason !== challengeReasonEnum.Duplicate;

  const metaEvidence = useEvidenceFile()(_metaEvidence.URI);

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
  const { sharedStakeMultiplier, submissionChallengeBaseDeposit } = useFragment(
    challengeButtonFragments.contract,
    contract
  );
  const totalCost = arbitrationCost
    ?.add(
      arbitrationCost
        .mul(web3.utils.toBN(sharedStakeMultiplier))
        .div(web3.utils.toBN(10000))
    )
    .add(web3.utils.toBN(submissionChallengeBaseDeposit));

  const [type, setType] = useState(challengeReasonEnum.None);
  const duplicateTypeSelected = type === challengeReasonEnum.Duplicate;
  const [duplicate, setDuplicate] = useState();
  const { receipt, send, loading } = useContract(
    "proofOfHumanity",
    "challengeRequest"
  );
  const isGraphSynced = useIsGraphSynced(receipt?.blockNumber);
  return (
    <Popup
      contentStyle={{ width: undefined }}
      trigger={
        <Button
          sx={{
            marginY: 1,
            width: "100%",
          }}
          disabled={disputed && currentReasonIsNotDuplicate}
          disabledTooltip="Already Challenged"
          loading={!isGraphSynced}
        >
          Challenge Request
        </Button>
      }
      modal
    >
      {(close) => (
        <Box sx={{ fontWeight: "bold", padding: 2 }}>
          <Card
            variant="muted"
            sx={{ fontSize: 1, marginBottom: 2 }}
            mainSx={{ padding: 0 }}
          >
            <Link newTab href={metaEvidence?.fileURI}>
              <Text>{metaEvidence && "Primary Document"}</Text>
            </Link>
          </Card>
          <Text sx={{ marginBottom: 1 }}>Deposit:</Text>
          <Card
            variant="muted"
            sx={{ fontSize: 2, marginBottom: 2 }}
            mainSx={{ padding: 0 }}
          >
            <Text>
              {totalCost && `${web3.utils.fromWei(totalCost)} ETH Deposit`}
            </Text>
          </Card>
          {status === submissionStatusEnum.PendingRegistration && (
            <>
              <Text sx={{ marginBottom: 1 }}>Challenge Type:</Text>
              <Grid sx={{ marginBottom: 2 }} gap={1} columns={[1, 2, 4]}>
                <ChallengeTypeCard
                  type={challengeReasonEnum.IncorrectSubmission}
                  setType={setType}
                  currentType={type}
                  disabled={usedReasons.IncorrectSubmission || disputed}
                />
                <ChallengeTypeCard
                  type={challengeReasonEnum.Deceased}
                  setType={setType}
                  currentType={type}
                  disabled={usedReasons.Deceased || disputed}
                />
                <ChallengeTypeCard
                  type={challengeReasonEnum.Duplicate}
                  setType={setType}
                  currentType={type}
                  disabled={
                    usedReasons.Duplicate && currentReasonIsNotDuplicate
                  }
                />
                <ChallengeTypeCard
                  type={challengeReasonEnum.DoesNotExist}
                  setType={setType}
                  currentType={type}
                  disabled={usedReasons.DoesNotExist || disputed}
                />
              </Grid>
            </>
          )}
          {duplicateTypeSelected && (
            <DuplicateInput
              submissionID={submissionID}
              setDuplicate={setDuplicate}
            />
          )}
          <Button
            sx={{ display: "block", margin: "auto" }}
            disabled={(duplicateTypeSelected && !duplicate) || !totalCost}
            onClick={() =>
              send(
                submissionID,
                type.index,
                duplicate || zeroAddress,
                zeroAddress,
                { value: totalCost }
              ).then(() => close())
            }
            loading={loading}
          >
            Challenge Request
          </Button>
        </Box>
      )}
    </Popup>
  );
}
