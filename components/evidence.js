import { DownArrow, File, UpArrow } from "@kleros/icons";
import { Box, Flex } from "theme-ui";

import Alert from "./alert";
import Card from "./card";
import Identicon from "./identicon";
import Link from "./link";
import { NextETHLink } from "./next-router";
import ScrollTo, { ScrollArea } from "./scroll-to";
import SubmitEvidenceButton from "./submit-evidence-button";
import Text from "./text";

const intlDateTimeFormat = new Intl.DateTimeFormat("default", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZoneName: "short",
  hour12: false,
});
function EvidenceItem({
  useEvidenceFile,
  evidence: { URI, sender, creationTime },
  index,
}) {
  const evidence = useEvidenceFile()(URI);
  if (evidence?.fileURIError) return null;
  return (
    <Card
      sx={{ marginBottom: 2 }}
      mainSx={{ alignItems: "flex-start", flexDirection: "column" }}
      footer={
        <>
          <Flex sx={{ alignItems: "center" }}>
            <Identicon address={sender} />
            <Box sx={{ marginLeft: 1 }}>
              <Text>
                <Text as="span" sx={{ fontWeight: "bold" }}>
                  #{index}
                </Text>{" "}
                submitted by{" "}
                <NextETHLink address={sender}>{sender}</NextETHLink>
              </Text>
              <Text>
                {intlDateTimeFormat.format(new Date(creationTime * 1000))}
              </Text>
            </Box>
          </Flex>
          {evidence?.fileURI && (
            <Link newTab href={evidence?.fileURI}>
              <File sx={{ stroke: "background", path: { fill: "primary" } }} />
            </Link>
          )}
        </>
      }
      footerSx={{ justifyContent: "space-between", paddingX: 3 }}
    >
      <Text
        sx={{
          fontSize: 2,
          fontWeight: "bold",
        }}
      >
        {evidence?.name}
      </Text>
      <Text>
        {evidence?.description || (evidence ? "No description." : undefined)}
      </Text>
    </Card>
  );
}
export default function Evidence({
  contract,
  args,
  evidences,
  useEvidenceFile,
  submission,
}) {
  return (
    <ScrollTo>
      {({ scroll }) => (
        <Box sx={{ paddingX: 4 }}>
          <Flex
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 3,
            }}
          >
            <SubmitEvidenceButton contract={contract} args={args} />
            <Text
              sx={{ color: "primary" }}
              role="button"
              onClick={() =>
                scroll({ y: evidences.length * 190, smooth: true })
              }
            >
              Scroll to 1st Evidence{" "}
              <DownArrow
                sx={{ stroke: "background", path: { fill: "primary" } }}
              />
            </Text>
          </Flex>
          {submission?.disputed && (
            <Alert type="muted" title="Advice" sx={{ mb: 3 }}>
              <Text>
                Only send evidence if you believe that the submission is correct
                as it is. Sending new files as evidence won&apos;t help if the
                submitted ones are incorrect.
              </Text>
            </Alert>
          )}
          <ScrollArea
            sx={{
              marginBottom: 2,
              marginTop: -2,
              marginX: -4,
              maxHeight: 650,
              overflowY: "scroll",
              paddingTop: 3,
              paddingX: 4,
            }}
          >
            {evidences.map((evidence, index) => (
              <EvidenceItem
                key={evidence.id}
                useEvidenceFile={useEvidenceFile}
                evidence={evidence}
                index={evidences.length - index}
              />
            ))}
          </ScrollArea>
          <Flex
            sx={{
              justifyContent: "flex-end",
            }}
          >
            <Text
              sx={{ color: "primary" }}
              role="button"
              onClick={() => scroll({ y: 0, smooth: true })}
            >
              Scroll to Last Evidence{" "}
              <UpArrow
                sx={{ stroke: "background", path: { fill: "primary" } }}
              />
            </Text>
          </Flex>
        </Box>
      )}
    </ScrollTo>
  );
}
