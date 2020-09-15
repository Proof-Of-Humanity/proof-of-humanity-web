import { Text, TimeAgo } from "@kleros/components";
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
      request: requests(orderDirection: desc, first: 1) {
        lastStatusChange
        ...challengeButtonRequest
      }
    }
  `,
};
function Deadline({ label, datetime, button }) {
  return (
    <Text>
      <Text sx={{ fontWeight: "bold" }}>{label}: </Text>
      <TimeAgo datetime={datetime} />
      {Date.now() < datetime && button}
    </Text>
  );
}
export default function Deadlines({ submission, contract, status }) {
  const { request, id, submissionTime, renewalTimestamp } = useFragment(
    deadlinesFragments.submission,
    submission
  );
  const { challengePeriodDuration } = (contract = useFragment(
    deadlinesFragments.contract,
    contract
  ));
  return (
    <>
      <Deadline
        label="Last Change"
        datetime={request[0].lastStatusChange * 1000}
      />
      {status === submissionStatusEnum.PendingRegistration ||
      status === submissionStatusEnum.PendingRemoval ? (
        <Deadline
          label="Challenge Deadline"
          datetime={
            (Number(request[0].lastStatusChange) +
              Number(challengePeriodDuration)) *
            1000
          }
          button={
            <ChallengeButton
              request={request[0]}
              contract={contract}
              submissionID={id}
            />
          }
        />
      ) : (
        submissionTime && (
          <>
            <Deadline label="Accepted" datetime={submissionTime * 1000} />
            <Deadline label="Renewal" datetime={renewalTimestamp * 1000} />
          </>
        )
      )}
    </>
  );
}
