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
      request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
        requester
        arbitrator
        arbitratorExtraData
        evidence(orderBy: creationTime, orderDirection: desc) {
          id
          URI
          sender
        }
        challenges(orderBy: creationTime) {
          id
          reason
          disputeID
          challenger
          rounds(orderBy: creationTime, orderDirection: desc, first: 1) {
            paidFees
            hasPaid
          }
        }
      }
    }
  `,
};
function SubmissionDetailsAccordionItem({ heading, panel }) {
  return (
    <AccordionItem>
      <AccordionItemHeading>{heading}</AccordionItemHeading>
      <AccordionItemPanel>{panel}</AccordionItemPanel>
    </AccordionItem>
  );
}
export default function SubmissionDetailsAccordion({ submission, contract }) {
  const {
    id,
    request: [
      { evidence, challenges, requester, arbitrator, arbitratorExtraData },
    ],
  } = useFragment(submissionDetailsAccordionFragments.submission, submission);
  const {
    sharedStakeMultiplier,
    winnerStakeMultiplier,
    loserStakeMultiplier,
  } = useFragment(submissionDetailsAccordionFragments.contract, contract);
  return (
    <Accordion>
      <SubmissionDetailsAccordionItem
        heading="Evidence"
        panel={
          <Evidence
            contract="proofOfHumanity"
            args={[id]}
            evidence={evidence}
            useEvidenceFile={useEvidenceFile}
          />
        }
      />
      <SubmissionDetailsAccordionItem
        heading="Voting History"
        panel="Voting History"
      />
      <SubmissionDetailsAccordionItem
        heading="Appeal"
        panel={
          <Appeal
            challenges={challenges.map((challenge) => ({
              ...challenge,
              reason: challengeReasonEnum.parse(challenge.reason),
              parties: [requester, challenge.challenger],
            }))}
            sharedStakeMultiplier={sharedStakeMultiplier}
            winnerStakeMultiplier={winnerStakeMultiplier}
            loserStakeMultiplier={loserStakeMultiplier}
            arbitrator={arbitrator}
            arbitratorExtraData={arbitratorExtraData}
          />
        }
      />
    </Accordion>
  );
}
