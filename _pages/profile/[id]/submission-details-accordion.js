import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  Appeal,
  Evidence,
  VotingHistory,
  useWeb3,
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
          roundsLength
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
  } = useFragment(submissionDetailsAccordionFragments.submission, submission);
  const challenges = _challenges.map((challenge) => ({
    ...challenge,
    reason: challengeReasonEnum.parse(challenge.reason),
    parties: [requester, challenge.challenger],
  }));
  const {
    sharedStakeMultiplier,
    winnerStakeMultiplier,
    loserStakeMultiplier,
  } = useFragment(submissionDetailsAccordionFragments.contract, contract);
  const { web3 } = useWeb3();
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
      <SubmissionDetailsAccordionItem
        heading="Voting History"
        panel={
          <VotingHistory
            challenges={challenges}
            arbitrable={web3.contracts?.proofOfHumanity?.options?.address}
            arbitrator={arbitrator}
          />
        }
      />
    </Accordion>
  );
}
