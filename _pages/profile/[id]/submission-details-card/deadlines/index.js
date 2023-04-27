import {
  Button,
  NextLink,
  Text,
  TimeAgo,
  useContract,
  useWeb3,
} from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import ChallengeButton from "./challenge-button";
import RemoveButton from "./remove-button";
import WithdrawButton from "./withdraw-button";

import { submissionStatusEnum } from "data";

const deadlinesFragments = {
  contract: graphql`
    fragment deadlinesContract on Contract {
      renewalTime
      challengePeriodDuration
      ...removeButtonContract
    }
  `,
  submission: graphql`
    fragment deadlinesSubmission on Submission {
      id
      submissionTime
      request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
        lastStatusChange
        ...challengeButtonRequest
        ...removeButtonRequest
      }
    }
  `,
};

function Deadline({ label, datetime }) {
  return (
    <Text>
      <Text sx={{ fontWeight: "bold" }}>{label}: </Text>
      <TimeAgo datetime={datetime} />
    </Text>
  );
}

export default function Deadlines({ submission, contract, status }) {
  const {
    request: [request],
    id,
    submissionTime,
  } = useFragment(deadlinesFragments.submission, submission);
  const { renewalTime, challengePeriodDuration } = (contract = useFragment(
    deadlinesFragments.contract,
    contract
  ));
  const [submissionDuration] = useContract(
    "proofOfHumanity",
    "submissionDuration"
  );
  const renewalTimestamp =
    (Number(submissionTime) + (submissionDuration - renewalTime)) * 1000;
  const expirationTimestamp =
    (Number(submissionTime) + Number(submissionDuration)) * 1000;
  const [accounts] = useWeb3("eth", "getAccounts");

  const isSelf =
    accounts?.[0] && accounts[0].toLowerCase() === id.toLowerCase();

  return (
    <>
      <Deadline
        label="Last Change"
        datetime={request.lastStatusChange * 1000}
      />
      {status === submissionStatusEnum.PendingRegistration ||
      status === submissionStatusEnum.PendingRemoval ||
      status === submissionStatusEnum.ChallengedRegistration ||
      status === submissionStatusEnum.ChallengedRemoval ? (
        <Deadline
          label="Challenge Deadline"
          datetime={
            (Number(request.lastStatusChange) +
              Number(challengePeriodDuration)) *
            1000
          }
          button={
            <ChallengeButton
              request={request}
              status={status}
              submissionID={id}
            />
          }
        />
      ) : status === submissionStatusEnum.Registered ||
        status === submissionStatusEnum.Expired ||
        (status === submissionStatusEnum.Removed &&
          submissionTime !== null &&
          submissionTime !== String(0)) ? (
        <>
          <Deadline label="Accepted" datetime={submissionTime * 1000} />
          <Deadline
            label={Date.now() > expirationTimestamp ? "Expired" : "Expires"}
            datetime={expirationTimestamp}
          />
          {Date.now() < expirationTimestamp && (
            <Deadline label="Renewal available" datetime={renewalTimestamp} />
          )}

          {status === submissionStatusEnum.Registered &&
            Date.now() < renewalTimestamp && (
              <RemoveButton
                request={request}
                contract={contract}
                submissionID={id}
              />
            )}

          {isSelf &&
            (Date.now() > renewalTimestamp ||
              status === submissionStatusEnum.Removed) && (
              <NextLink
                href="/profile/[id]?reapply=true"
                as={`/profile/${accounts?.[0]}`}
              >
                <Button
                  sx={{
                    width: "100%",
                    marginY: 1,
                  }}
                >
                  Reapply
                </Button>
              </NextLink>
            )}
        </>
      ) : status === submissionStatusEnum.Removed &&
        submissionTime === null &&
        isSelf ? (
        <NextLink
          href="/profile/[id]?reapply=true"
          as={`/profile/${accounts?.[0]}`}
        >
          <Button
            sx={{
              width: "100%",
              marginY: 1,
            }}
          >
            Reapply
          </Button>
        </NextLink>
      ) : status === submissionStatusEnum.Vouching && isSelf ? (
        <WithdrawButton
          sx={{
            marginY: 1,
            width: "100%",
          }}
        />
      ) : null}
    </>
  );
}
