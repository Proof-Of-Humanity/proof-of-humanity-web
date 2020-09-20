import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  Evidence,
} from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import { useEvidenceFile } from "data";

const submissionDetailsAccordionFragment = graphql`
  fragment submissionDetailsAccordion on Submission {
    id
    request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
      evidence(orderBy: creationTime, orderDirection: desc) {
        id
        URI
        sender
      }
    }
  }
`;
function SubmissionDetailsAccordionItem({ heading, panel }) {
  return (
    <AccordionItem>
      <AccordionItemHeading>{heading}</AccordionItemHeading>
      <AccordionItemPanel>{panel}</AccordionItemPanel>
    </AccordionItem>
  );
}
export default function SubmissionDetailsAccordion({ submission }) {
  const {
    id,
    request: [{ evidence }],
  } = useFragment(submissionDetailsAccordionFragment, submission);
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
      <SubmissionDetailsAccordionItem heading="Appeal" panel="Appeal" />
    </Accordion>
  );
}
