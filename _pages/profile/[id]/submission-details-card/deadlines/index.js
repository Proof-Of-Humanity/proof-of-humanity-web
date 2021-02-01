import { Link, NextLink, Text, TimeAgo, useWeb3 } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import ChallengeButton from "./challenge-button";
import RemoveButton from "./remove-button";

import { submissionStatusEnum } from "data";

const deadlinesFragments = {
  contract: graphql`
    fragment deadlinesContract on Contract {
      submissionDuration
      renewalTime
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
      request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
        lastStatusChange
        resolved
        ...challengeButtonRequest
        ...removeButtonRequest
      }
    }
  `,
};
function Deadline({
  label,
  datetime,
  whenDatetime = (now, _datetime) => now < _datetime,
  button,
}) {
  return (
    <Text>
      <Text sx={{ fontWeight: "bold" }}>{label}: </Text>
      <TimeAgo datetime={datetime} />
      {whenDatetime(Date.now(), datetime) && button}
    </Text>
  );
}
export default function Deadlines({ submission, contract, status }) {
  const {
    request: [request],
    id,
    registered,
    submissionTime,
  } = useFragment(deadlinesFragments.submission, submission);
  const {
    submissionDuration,
    renewalTime,
    challengePeriodDuration,
  } = (contract = useFragment(deadlinesFragments.contract, contract));
  const renewalTimestamp =
    (Number(submissionTime) + (submissionDuration - renewalTime)) * 1000;
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
              whenDatetime={(now, datetime) =>
                now < renewalTimestamp ||
                now - datetime > submissionDuration * 1000
              }
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
              datetime={renewalTimestamp}
              whenDatetime={(now, datetime) => now >= datetime}
              button={
                accounts?.[0] &&
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
