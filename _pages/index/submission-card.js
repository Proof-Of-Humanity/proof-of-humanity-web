import { Card, Image, NextLink, Text } from "@kleros/components";
import { graphql, useFragment } from "relay-hooks";

import { submissionStatusEnum, useEvidenceFile } from "data";

import { useTranslation } from 'react-i18next'; 

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
  const { t, i18n } = useTranslation();

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
        sx={{ height: 326, color: "text" }}
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
              {t(`profile_status_${status.key}`)}
              {isExpired && ` (${t('profile_status_Expired')})`}
            </Text>
          </>
        }
        mainSx={{ flexDirection: "column" }}
      >
        <Image crossOrigin="anonymous" variant="avatar" src={evidence?.file?.photo} />
        <Text
          sx={{
            fontSize: 1,
            fontWeight: "bold",
            marginY: 1,
            overflowWrap: "anywhere",
          }}
        >
          {evidence?.file?.name}
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
