import { Card, Image, Text } from "@kleros/components";
import { EtherscanLogo } from "@kleros/icons";
import { graphql, useFragment } from "relay-hooks";

import { submissionStatusEnum, useEvidenceFile } from "data";

const submissionCardFragment = graphql`
  fragment submissionCard on Submission {
    status
    registered
    requests(orderDirection: desc, first: 2) {
      evidence(first: 1) {
        URI
      }
    }
  }
`;
export default function SubmissionCard({ submission }) {
  const { requests, ...rest } = useFragment(submissionCardFragment, submission);
  const status = submissionStatusEnum.parse(rest);
  const evidence = useEvidenceFile()(
    requests[status.registrationEvidenceFileIndex || 0].evidence[0].URI
  );
  return (
    <Card
      header={
        <>
          <status.Icon />
          <Text>{status.startCase}</Text>
        </>
      }
      headerSx={{
        backgroundColor: status.camelCase,
        color: "background",
        fontWeight: "bold",
      }}
      mainSx={{ flexDirection: "column" }}
      footer={<EtherscanLogo />}
    >
      <Image variant="avatar" src={evidence?.file?.photo} />
      <Text
        sx={{
          fontSize: 1,
          fontWeight: "bold",
          marginY: 1,
        }}
      >
        {evidence?.file?.name}
      </Text>
      <Text sx={{ textAlign: "center" }} count={3}>
        {evidence?.file?.bio}
      </Text>
    </Card>
  );
}
