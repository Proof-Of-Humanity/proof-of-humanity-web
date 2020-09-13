import { Card, Image, Link, NextLink, Text } from "@kleros/components";
import { EtherscanLogo } from "@kleros/icons";
import { graphql, useFragment } from "relay-hooks";

import { submissionStatusEnum, useEvidenceFile } from "data";

const submissionCardFragment = graphql`
  fragment submissionCard on Submission {
    id
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
  const { requests, id, ...rest } = useFragment(
    submissionCardFragment,
    submission
  );
  const status = submissionStatusEnum.parse(rest);
  const evidence = useEvidenceFile()(
    requests[status.registrationEvidenceFileIndex || 0].evidence[0].URI
  );
  return (
    <NextLink href="/profile/[id]" as={`/profile/${id}`}>
      <Link variant="unstyled">
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
          <Text
            variant="multiClipped"
            sx={{
              height: 52,
              textAlign: "center",
            }}
            count={2}
          >
            {evidence?.file?.bio}
          </Text>
        </Card>
      </Link>
    </NextLink>
  );
}
