import { Link, NextLink, Text, TimeAgo } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import ChallengeButton from "./challenge-button";

import { submissionStatusEnum } from "data";

const deadlinesFragments = {
  contract: graphql`
    fragment deadlinesContract on Contract {
      challengePeriodDuration
      ...challengeButtonContract
    }
  `,
  submission: graphql`
    fragment deadlinesSubmission on Submission {
      id
      submissionTime
      renewalTimestamp
      request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
        lastStatusChange
        ...challengeButtonRequest
      }
    }
  `,
};
function Deadline({ label, datetime, afterDatetime, button }) {
  return (
    <Text>
      <Text sx={{ fontWeight: "bold" }}>{label}: </Text>
      <TimeAgo datetime={datetime} />
      {afterDatetime ? Date.now() >= datetime : Date.now() < datetime && button}
    </Text>
  );
}
export default function Deadlines({ submission, contract, status }) {
  const {
    request: [request],
    id,
    submissionTime,
    renewalTimestamp,
  } = useFragment(deadlinesFragments.submission, submission);
  const { challengePeriodDuration } = (contract = useFragment(
    deadlinesFragments.contract,
    contract
  ));
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
              submissionID={id}
            />
          }
        />
      ) : (
        submissionTime && (
          <>
            <Deadline label="Accepted" datetime={submissionTime * 1000} />
            <Deadline
              label="Renewal"
              datetime={renewalTimestamp * 1000}
              afterDatetime
              button={
                <NextLink href="/profile/[id]" as="/profile/reapply">
                  <Link>Reapply</Link>
                </NextLink>
              }
            />
          </>
        )
      )}
    </>
  );
}
