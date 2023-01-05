import { Card, Image, NextLink, Text, useContract } from "@kleros/components";
import { useTranslation } from "react-i18next";
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

function statusColorCode(key) {
  let color = "#fff";

  switch (key) {
    case "PendingRegistration":
    case "PendingRemoval":
      color = "#fbb630";
      break;
    case "Vouching":
      color = "#ff81b7";
      break;
    case "ChallengedRegistration":
    case "ChallengedRemoval":
    case "Expired":
      color = "#ff006d";
      break;
    case "Registered":
      color = "#91ff81";
      break;
    default:
  }

  return `0px -1px 0px ${color}`;
}

export default function SubmissionCard({ submission }) {
  const { t } = useTranslation();

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
        sx={{
          height: 326,
          color: "text",
          boxShadow: statusColorCode(status.key),
          // borderTop: `1px solid ${statusColorCode(status.key)}`,
        }}
        css={{ textDecoration: "none" }}
        header={
          <>
            <Image
              src="/images/eth.svg"
              crossOrigin="anonymous"
              alt={t(`chain_Mainnet`)}
              sx={{
                objectFit: "contain",
                height: "20px",
              }}
            />
            <Text
              sx={{
                fontSize: "13px",
              }}
            >
              {t(`profile_status_${status.key}`)}
              {isExpired && ` (${t("profile_status_Expired")})`}
            </Text>
          </>
        }
        mainSx={{ flexDirection: "column" }}
      >
        <Image
          crossOrigin="anonymous"
          variant="avatar"
          src={evidence?.file?.photo}
        />
        <Text
          sx={{
            fontSize: 1,
            fontWeight: "bold",
            marginY: 1,
            overflowWrap: "anywhere",
          }}
        >
          {name}
        </Text>
        <Text
          variant="multiClipped"
          sx={{
            opacity: 0.66,
            lineHeight: "18px",
            height: 36,
            fontSize: "12px",
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
