import { Link, NextLink, Text, TimeAgo, useWeb3 } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import ChallengeButton from "./challenge-button";
import RemoveButton from "./remove-button";

import { submissionStatusEnum } from "data";

const deadlinesFragments = {
  contract: graphql`
    fragment deadlinesContract on Contract {
      challengePeriodDuration
      ...challengeButtonContract
      ...removeButtonContract
    }
  `,
  submission: graphql`
    fragment deadlinesSubmission on Submission {
      id
      registered
      submissionTime
      renewalTimestamp
      request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
        lastStatusChange
        resolved
        ...challengeButtonRequest
        ...removeButtonRequest
      }
    }
  `,
};
function Deadline({ label, datetime, afterDatetime, button }) {
  return (
    <Text>
      <Text sx={{ fontWeight: "bold" }}>{label}: </Text>
      <TimeAgo datetime={datetime} />
      {(afterDatetime ? Date.now() >= datetime : Date.now() < datetime) &&
        button}
    </Text>
  );
}
export default function Deadlines({ submission, contract, status }) {
  const {
    request: [request],
    id,
    registered,
    submissionTime,
    renewalTimestamp,
  } = useFragment(deadlinesFragments.submission, submission);
  const { challengePeriodDuration } = (contract = useFragment(
    deadlinesFragments.contract,
    contract
  ));
  const [accounts] = useWeb3("eth", "getAccounts");
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
              contract={contract}
              status={status}
              submissionID={id}
            />
          }
        />
      ) : (
        request.resolved &&
        registered && (
          <>
            <Deadline
              label="Accepted"
              datetime={submissionTime * 1000}
              afterDatetime
              button={
                <RemoveButton
                  request={request}
                  contract={contract}
                  submissionID={id}
                />
              }
            />
            <Deadline
              label="Renewal"
              datetime={renewalTimestamp * 1000}
              afterDatetime
              button={
                accounts &&
                accounts[0].toLowerCase() === id.toLowerCase() && (
                  <NextLink href="/profile/[id]" as="/profile/reapply">
                    <Link sx={{ display: "block" }}>Reapply</Link>
                  </NextLink>
                )
              }
            />
          </>
        )
      )}
    </>
  );
}
