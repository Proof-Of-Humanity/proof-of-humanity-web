import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  Appeal,
  Evidence,
} from "@kleros/components";
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
      request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
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
          reason
          disputeID
          challenger
          challengeID
          rounds(
            orderBy: creationTime
            orderDirection: asc
            first: 1
            skip: 1
          ) {
            paidFees
            hasPaid
          }
          roundsLength
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
  const {
    request: [
      {
        challenges: _challenges,
        requester,
        evidence,
        arbitrator,
        arbitratorExtraData,
      },
    ],
    id,
    disputed,
  } = useFragment(submissionDetailsAccordionFragments.submission, submission);
  const challenges = _challenges
    .map((challenge) => ({
      ...challenge,
      reason: challengeReasonEnum.parse(challenge.reason),
      parties: [requester, challenge.challenger],
    }))
    .filter(({ disputeID }) => disputeID !== null);
  const {
    sharedStakeMultiplier,
    winnerStakeMultiplier,
    loserStakeMultiplier,
  } = useFragment(submissionDetailsAccordionFragments.contract, contract);

  const challengesWithPendingAppeals = challenges.filter(
    ({ rounds }) => !rounds[0].hasPaid[0] || !rounds[0].hasPaid[0]
  );

  return (
    <Accordion>
      <SubmissionDetailsAccordionItem
        heading="Evidence"
        panelSx={{ paddingX: 0 }}
        panel={
          <Evidence
            contract="proofOfHumanity"
            args={[id]}
            evidence={evidence}
            useEvidenceFile={useEvidenceFile}
          />
        }
      />
      {disputed && challengesWithPendingAppeals.length > 0 && (
        <SubmissionDetailsAccordionItem
          heading="Appeal"
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
