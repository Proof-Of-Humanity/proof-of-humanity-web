import { DownArrow, File, UpArrow } from "@kleros/icons";
import { Flex } from "theme-ui";

import Card from "./card";
import Link from "./link";
import { NextETHLink } from "./next-router";
import ScrollTo, { ScrollArea } from "./scroll-to";
import SubmitEvidenceButton from "./submit-evidence-button";
import Text from "./text";

function EvidenceItem({ useEvidenceFile, evidence: { URI, sender }, index }) {
  const evidence = useEvidenceFile()(URI);
  return (
    <Card
      sx={{ marginBottom: 2 }}
      mainSx={{ alignItems: "flex-start", flexDirection: "column" }}
      footer={
        <>
          <Text>
            #{index} Submitted by{" "}
            <NextETHLink address={sender}>{sender}</NextETHLink>
          </Text>
          {evidence?.fileURI && (
            <Link newTab href={evidence?.fileURI}>
              <File />
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
  evidence,
  useEvidenceFile,
}) {
  return (
    <ScrollTo>
      {({ scroll }) => (
        <>
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
              onClick={() => scroll({ y: evidence.length * 180, smooth: true })}
            >
              Scroll to 1st Evidence <DownArrow />
            </Text>
          </Flex>
          <ScrollArea
            sx={{
              marginBottom: 2,
              maxHeight: 540,
              overflowY: "scroll",
            }}
          >
            {evidence.map((_evidence, index) => (
              <EvidenceItem
                key={_evidence.id}
                useEvidenceFile={useEvidenceFile}
                evidence={_evidence}
                index={evidence.length - index}
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
              Scroll to Last Evidence <UpArrow />
            </Text>
          </Flex>
        </>
      )}
    </ScrollTo>
  );
}
