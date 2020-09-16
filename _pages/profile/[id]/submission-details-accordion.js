import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
} from "@kleros/components";

function SubmissionDetailsAccordionItem({ heading, panel }) {
  return (
    <AccordionItem>
      <AccordionItemHeading>{heading}</AccordionItemHeading>
      <AccordionItemPanel>{panel}</AccordionItemPanel>
    </AccordionItem>
  );
}
export default function SubmissionDetailsAccordion() {
  return (
    <Accordion>
      <SubmissionDetailsAccordionItem heading="Evidence" panel="Evidence" />
      <SubmissionDetailsAccordionItem
        heading="Voting History"
        panel="Voting History"
      />
      <SubmissionDetailsAccordionItem heading="Appeal" panel="Appeal" />
    </Accordion>
  );
}
