import { Text, TimeAgo } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import { submissionStatusEnum } from "data";

const deadlinesFragments = {
  contract: graphql`
    fragment deadlinesContract on Contract {
      challengePeriodDuration
    }
  `,
  submission: graphql`
    fragment deadlinesSubmission on Submission {
      submissionTime
      renewalTimestamp
      request: requests(orderDirection: desc, first: 1) {
        lastStatusChange
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
  const { request, submissionTime, renewalTimestamp } = useFragment(
    deadlinesFragments.submission,
    submission
  );
  const { challengePeriodDuration } = useFragment(
    deadlinesFragments.contract,
    contract
  );
  return (
    <>
      <Deadline
        label="Submitted"
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
