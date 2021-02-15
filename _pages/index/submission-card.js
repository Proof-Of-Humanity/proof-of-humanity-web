import { Card, Image, NextETHLink, NextLink, Text } from "@kleros/components";
import { EtherscanLogo } from "@kleros/icons";
import { graphql, useFragment } from "relay-hooks";

import { submissionStatusEnum, useEvidenceFile } from "data";

const submissionCardFragments = {
  contract: graphql`
    fragment submissionCardContract on Contract {
      submissionDuration
    }
  `,
  submission: graphql`
    fragment submissionCardSubmission on Submission {
      id
      status
      registered
      submissionTime
      name
      disputed
      requests(
        orderBy: creationTime
        orderDirection: desc
        first: 1
        where: { registration: true }
      ) {
        evidence(orderBy: creationTime, first: 1) {
          URI
        }
      }
    }
  `,
};
export default function SubmissionCard({ submission, contract }) {
  const {
    submissionTime,
    requests: [request],
    id,
    name,
    ...rest
  } = useFragment(submissionCardFragments.submission, submission);
  const { submissionDuration } = useFragment(
    submissionCardFragments.contract,
    contract
  );
  const status = submissionStatusEnum.parse(rest);
  const isExpired =
    status === submissionStatusEnum.Registered &&
    Date.now() / 1000 - submissionTime > submissionDuration;
  const evidence = useEvidenceFile()(request.evidence[0].URI);
  return (
    <NextLink href="/profile/[id]" as={`/profile/${id}`}>
      <Card
        sx={{ height: 367 }}
        header={
          <>
            <status.Icon
              sx={{
                stroke: status.camelCase,
                path: { fill: status.camelCase },
              }}
            />
            <Text>
              {status.startCase}
              {isExpired && " (Expired)"}
            </Text>
          </>
        }
        mainSx={{ flexDirection: "column" }}
        footer={
          <NextETHLink address={id}>
            <EtherscanLogo />
          </NextETHLink>
        }
      >
        <Image variant="avatar" src={evidence?.file?.photo} />
        <Text
          sx={{
            fontSize: 1,
            fontWeight: "bold",
            marginY: 1,
          }}
        >
          {evidence instanceof Error
            ? "Tampered Data, Reject"
            : evidence?.file?.name &&
              (name.replaceAll(/[^\s\w]/g, "") ===
              evidence.file.name.replaceAll(/[^\s\w]/g, "")
                ? evidence.file.name
                : "Tampered Data, Reject")}
        </Text>
        <Text
          variant="multiClipped"
          sx={{
            height: 52,
            textAlign: "center",
            wordBreak: "break-word",
          }}
          count={2}
        >
          {evidence?.file ? evidence.file.bio || " " : null}
        </Text>
      </Card>
    </NextLink>
  );
}
