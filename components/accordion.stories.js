import Accordion, {
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
} from "./accordion";

const metadata = {
  title: "Components/Accordion",
  component: Accordion,
  argTypes: {
    allowMultipleExpanded: {
      type: "boolean",
      description: "Allow expanding multiple accordion items.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    allowZeroExpanded: {
      type: "boolean",
      description: "Allow collapsing all accordion items.",
      table: {
        type: {
          summary: "boolean",
        },
      },
      defaultValue: true,
    },
    sx: {
      type: "object",
      description: "Theme UI sx prop.",
      table: {
        type: {
          summary: "object",
        },
      },
    },
    children: {
      type: { name: "object", required: true },
      description:
        "AccordionItem elements wrapping AccordionItemHeading and AccordionItemPanel elements.",
      table: {
        type: {
          summary: "AccordionItem[[AccordionItemHeading,AccordionItemPanel]]",
        },
      },
    },
    "...rest": {
      type: "object",
      description: "The accordion's additional props.",
      table: {
        type: {
          summary: "object",
        },
      },
      control: null,
    },
  },
};
export default metadata;

function Template(args) {
  return (
    <Accordion {...args}>
      <AccordionItem>
        <AccordionItemHeading>Evidence</AccordionItemHeading>
        <AccordionItemPanel>Evidence Panel</AccordionItemPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeading>Appeal</AccordionItemHeading>
        <AccordionItemPanel>Appeal Panel</AccordionItemPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeading>Voting History</AccordionItemHeading>
        <AccordionItemPanel>Voting History Panel</AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}

export const MultipleExpanded = Template.bind();

export const SingleExpanded = Template.bind();
SingleExpanded.args = { allowMultipleExpanded: false };
