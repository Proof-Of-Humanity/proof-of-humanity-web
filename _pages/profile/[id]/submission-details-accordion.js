import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  Appeal,
  Evidence,
  PreviousRequests,
} from "@kleros/components";
import { useTranslation } from "react-i18next";
import { graphql, useFragment } from "relay-hooks";

import { challengeReasonEnum, useEvidenceFile } from "data";

const submissionDetailsAccordionFragments = {
  contract: graphql`
    fragment submissionDetailsAccordionContract on Contract {
      sharedStakeMultiplier
      winnerStakeMultiplier
      loserStakeMultiplier
    }
  `,
  submission: graphql`
    fragment submissionDetailsAccordionSubmission on Submission {
      id
      disputed
      requests(
        orderBy: creationTime
        orderDirection: asc
        where: { registration: true }
      ) {
        evidence(orderBy: creationTime, orderDirection: desc) {
          URI
          creationTime
          id
        }
      }
      request: requests(orderBy: creationTime, orderDirection: desc) {
        requester
        arbitrator
        arbitratorExtraData
        id
        evidence(orderBy: creationTime, orderDirection: desc) {
          creationTime
          id
          URI
          sender
        }
        challenges(orderBy: creationTime) {
          id
          appealPeriod
          reason
          disputeID
          challenger
          challengeID
          rounds(orderBy: creationTime, orderDirection: desc, first: 1) {
            paidFees
            hasPaid
          }
          lastRoundID
        }
      }
    }
  `,
};

function SubmissionDetailsAccordionItem({ heading, panelSx, panel }) {
  return (
    <AccordionItem>
      <AccordionItemHeading>{heading}</AccordionItemHeading>
      <AccordionItemPanel sx={panelSx}>{panel}</AccordionItemPanel>
    </AccordionItem>
  );
}
export default function SubmissionDetailsAccordion({ submission, contract }) {
  const { t } = useTranslation();

  const {
    request: [
      {
        challenges: _challenges,
        requester,
        evidence: evidences,
        arbitrator,
        arbitratorExtraData,
      },
    ],
    id,
    disputed,
    requests,
  } = useFragment(submissionDetailsAccordionFragments.submission, submission);

  const challenges = _challenges
    .filter(({ disputeID }) => disputeID !== null)
    .map((challenge) => ({
      ...challenge,
      reason: challengeReasonEnum.parse(challenge.reason),
      parties: [requester, challenge.challenger],
    }));

  const { sharedStakeMultiplier, winnerStakeMultiplier, loserStakeMultiplier } =
    useFragment(submissionDetailsAccordionFragments.contract, contract);

  const challengesWithPendingAppeals = challenges
    .filter(
      (c) =>
        // eslint-disable-next-line regex/invalid
        c.appealPeriod[0] !== "0" && c.appealPeriod[1] !== "0"
    )
    .filter(({ rounds }) => !rounds[0].hasPaid[0] || !rounds[0].hasPaid[1]);
  const requestsForUI = requests.slice(1);
  return (
    <Accordion>
      {requestsForUI.length >= 1 && (
        <SubmissionDetailsAccordionItem
          heading={t("profile_details_previous_requests")}
          panelSx={{ paddingX: 0, borderRadius: 12 }}
          panel={
            <PreviousRequests
              useEvidenceFile={useEvidenceFile}
              requests={requestsForUI}
            />
          }
        />
      )}
      <SubmissionDetailsAccordionItem
        heading={t("profile_details_evidence")}
        panelSx={{ paddingX: 0, borderRadius: 12 }}
        panel={
          <Evidence
            contract="proofOfHumanity"
            args={[id]}
            evidences={evidences}
            useEvidenceFile={useEvidenceFile}
            submission={submission}
          />
        }
      />
      {disputed && challengesWithPendingAppeals.length > 0 && (
        <SubmissionDetailsAccordionItem
          heading={t("profile_details_appeal")}
          panel={
            <Appeal
              challenges={challenges}
              sharedStakeMultiplier={sharedStakeMultiplier}
              winnerStakeMultiplier={winnerStakeMultiplier}
              loserStakeMultiplier={loserStakeMultiplier}
              arbitrator={arbitrator}
              arbitratorExtraData={arbitratorExtraData}
              contract="proofOfHumanity"
              args={[id]}
            />
          }
        />
      )}
    </Accordion>
  );
}
