import { Button, NextLink, Text, TimeAgo, useWeb3 } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import ChallengeButton from "./challenge-button";
import RemoveButton from "./remove-button";
import WithdrawButton from "./withdraw-button";

import { submissionStatusEnum } from "data";
import { useTranslation } from 'react-i18next';

const deadlinesFragments = {
  contract: graphql`
    fragment deadlinesContract on Contract {
      submissionDuration
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
function Deadline({
  label,
  datetime,
  whenDatetime = (now, _datetime) => now < _datetime,
  displayEvenIfDeadlinePassed = true,
  button,
}) {
  if (displayEvenIfDeadlinePassed || Date.now() < datetime)
    return (
      <Text>
        <Text sx={{ fontWeight: "bold" }}>{label}: </Text>
        <TimeAgo datetime={datetime} />
        {whenDatetime(Date.now(), datetime) && button}
      </Text>
    );
  return null;
}
export default function Deadlines({ submission, contract, status }) {
  const { t } = useTranslation();

  const {
    request: [request],
    id,
    submissionTime,
  } = useFragment(deadlinesFragments.submission, submission);
  const { submissionDuration, renewalTime, challengePeriodDuration } =
    (contract = useFragment(deadlinesFragments.contract, contract));
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
        label={t('profile_card_deadline_last_change')}
        datetime={request.lastStatusChange * 1000}
      />
      {status === submissionStatusEnum.PendingRegistration ||
      status === submissionStatusEnum.PendingRemoval ||
      status === submissionStatusEnum.ChallengedRegistration ||
      status === submissionStatusEnum.ChallengedRemoval ? (
        <Deadline
          label={t('profile_card_deadline_challenge_deadline')}
          datetime={(Number(request.lastStatusChange) + Number(challengePeriodDuration)) * 1000}
          button={<ChallengeButton request={request} status={status} submissionID={id} />}
        />
      ) : status === submissionStatusEnum.Registered ||
        status === submissionStatusEnum.Expired ||
        (status === submissionStatusEnum.Removed &&
          submissionTime !== null &&
          submissionTime !== String(0)) ? (
        <>
          <Deadline
            label={t('profile_card_deadline_accepted')}
            datetime={submissionTime * 1000}
            whenDatetime={(now) =>
              status === submissionStatusEnum.Registered &&
              now < renewalTimestamp
            }
            button={<RemoveButton request={request} contract={contract} submissionID={id} />}
          />
          <Deadline
            label={t('profile_card_deadline_expires')}
            datetime={expirationTimestamp}
            button={
              Date.now() > expirationTimestamp ? (
                <RemoveButton request={request} contract={contract} submissionID={id} />
              ) : Date.now() > renewalTimestamp ? (
                <NextLink href="/profile/new?reapply=true" as={`/profile/new`}>
                  <Button sx={{ width: "100%", marginY: 1 }}>
                    {t('profile_card_deadline_reapply')}
                  </Button>
                </NextLink>
              ) : null
            }
          />
          <Deadline
            label={t('profile_card_deadline_renewal_available')}
            datetime={renewalTimestamp}
            displayEvenIfDeadlinePassed={false}
            whenDatetime={(now, datetime) =>
              now >= datetime ||
              status === submissionStatusEnum.Expired ||
              status === submissionStatusEnum.Removed
            }
            button={
              isSelf && (
                <NextLink href="/profile/new?reapply=true" as={`/profile/new`}>
                  <Button sx={{ width: "100%", marginY: 1 }}>{t('profile_card_deadline_reapply')}</Button>
                </NextLink>
              )
            }
          />
        </>
      ) : status === submissionStatusEnum.Removed &&
        submissionTime === null &&
        isSelf ? (
        <NextLink href="/profile/new?reapply=true" as={`/profile/new`}>
          <Button sx={{ width: "100%", marginY: 1 }}>{t('profile_card_deadline_reapply')}</Button>
        </NextLink>
      ) : status === submissionStatusEnum.Vouching && isSelf ? (
        <WithdrawButton sx={{ marginY: 1, width: "100%" }} />
      ) : null}
    </>
  );
}
