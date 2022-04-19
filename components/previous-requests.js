import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { Box, Flex } from "theme-ui";

import Card from "./card";
import { ScrollArea } from "./scroll-to";
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

function RequestItem({
  useEvidenceFile,
  request: { URI, creationTime },
  index,
}) {
  const { t } = useTranslation();
  const evidence = useEvidenceFile()(URI);
  if (evidence?.fileURIError) {
    return null;
  }
  return (
    <Card
      sx={{ marginBottom: 2 }}
      mainSx={{ alignItems: "flex-start", flexDirection: "column" }}
      footer={
        <Flex sx={{ alignItems: "center" }}>
          <Box sx={{ marginLeft: 1 }}>
            <Text as="span" sx={{ fontWeight: "bold" }}>
              #{index}{" "}
              {intlDateTimeFormat.format(new Date(creationTime * 1000))}
            </Text>
          </Box>
        </Flex>
      }
      footerSx={{ justifyContent: "space-between", paddingX: 3 }}
    >
      <Button
        type="primary"
        shape="round"
        style={{
          fontWeight: "bold",
          display: "block",
          backgroundColor: "#ffb978",
          border: "none",
          width: "max-content",
          height: "60px",
        }}
        onClick={() => (location.href = `?request=${index}`)}
      >
        {t("profile_details_previous_requests_button")} {index}
      </Button>
    </Card>
  );
}
export default function PreviousRequests({ requests, useEvidenceFile }) {
  return (
    <Box sx={{ paddingX: 4 }}>
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
        {requests.map((request, index) => (
          <RequestItem
            key={request.evidence[0].id}
            useEvidenceFile={useEvidenceFile}
            request={request.evidence[0]}
            index={requests.length - index}
          />
        ))}
      </ScrollArea>
    </Box>
  );
}
