import { Accordion } from "@kleros/components";

import AppealAccordionItem from "./appeal-accordion-item";
import EvidenceAccordionItem from "./evidence-accordion-item";
import VotingHistoryAccordionItem from "./voting-history-accordion-item";

export default function SubmissionDetailsAccordion() {
  return (
    <Accordion>
      <AppealAccordionItem />
      <EvidenceAccordionItem />
      <VotingHistoryAccordionItem />
    </Accordion>
  );
}
