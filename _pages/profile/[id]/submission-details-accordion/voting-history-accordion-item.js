import {
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  Text,
} from "@kleros/components";

export default function VotingHistoryAccordionItem() {
  return (
    <AccordionItem>
      <AccordionItemHeading>Voting History</AccordionItemHeading>
      <AccordionItemPanel>
        <Text>Voting History.</Text>
      </AccordionItemPanel>
    </AccordionItem>
  );
}
