import { Card, Image, NextLink, Text, useContract } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import { submissionStatusEnum, useEvidenceFile } from "data";

const submissionCardFragments = {
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

export default function SubmissionCard({ submission }) {
  const {
    submissionTime,
    requests: [request],
    id,
    name,
    ...rest
  } = useFragment(submissionCardFragments.submission, submission);
  const [submissionDuration] = useContract(
    "proofOfHumanity",
    "submissionDuration"
  );
  const status = submissionStatusEnum.parse({
    ...rest,
    submissionTime,
    submissionDuration,
  });

  const isExpired =
    status === submissionStatusEnum.Registered &&
    Date.now() / 1000 - submissionTime > submissionDuration;
  const evidence = useEvidenceFile()(request.evidence[0].URI);
  return (
    <NextLink href="/profile/[id]" as={`/profile/${id}`}>
      <Card
        as="a"
        sx={{ height: 367, color: "text" }}
        css={{ textDecoration: "none" }}
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
      >
        <Image variant="avatar" src={evidence?.file?.photo} />
        <Text
          sx={{
            fontSize: 1,
            fontWeight: "bold",
            marginY: 1,
            overflowWrap: "anywhere",
          }}
        >
          {evidence instanceof Error
            ? "We are doing some maintenance work and will be online again soon."
            : evidence?.file?.name &&
              (name.replaceAll(/[^\s\w]/g, "") ===
              evidence.file.name.replaceAll(/[^\s\w]/g, "")
                ? evidence.file.name
                : "We are doing some maintenance work and will be online again soon.")}
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
