import { Alert, Card, Image, Text, useQuery } from "@kleros/components";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { graphql } from "relay-hooks";

import SubmissionDetailsAccordion from "./submission-details-accordion";
import SubmissionDetailsCard from "./submission-details-card";

import { submissionStatusEnum } from "data";
import { Custom404 } from "pages";

export default function ProfileWithID() {
  const { t } = useTranslation();

  const { props } = useQuery();

  const router = useRouter();
  const { query } = router;

  const status =
    props?.submission &&
    props?.contract &&
    submissionStatusEnum.parse({ ...props.submission, ...props.contract });
  // const isExpired =
  //   status === submissionStatusEnum.Registered &&
  //   props?.submission &&
  //   Date.now() / 1000 - props.submission.submissionTime >
  //     props.contract.submissionDuration;

  const name = props?.submission?.name ?? "";

  if (props?.submission === null) {
    return <Custom404 />;
  }

  return (
    <>
      <Head>
        <title>{`${t("profile_title")}: ${
          name ? `${name} (${query.id})` : query.id
        } | Proof of Humanity`}</title>
      </Head>
      <Card
        sx={{ marginBottom: 2 }}
        mainSx={{
          flexWrap: "wrap",
          justifyContent: "space-between",
          paddingY: 1,
        }}
      >
        <Text
          sx={{
            alignItems: "center",
            display: "flex",
            fontWeight: "bold",
            minWidth: "fit-content",
          }}
        >
          <Image
            crossOrigin="anonymous"
            sx={{ height: 30, marginRight: 2 }}
            src="/images/proof-of-humanity-logo-black.png"
          />
          {t("profile_status")}
        </Text>
        <Text sx={{ display: "flex", alignItems: "center", gap: 8 }}>
          {status && (
            <>
              {t(`profile_status_${status.key}`)}
              {/* {isExpired && " (Expired)"} */}
              <status.Icon
                sx={{ path: { fill: "text" }, stroke: "text", strokeWidth: 0 }}
              />
            </>
          )}
        </Text>
      </Card>
      {status === submissionStatusEnum.Vouching && (
        <Alert
          type="muted"
          title={t("profile_advice")}
          sx={{ mb: 2, fontSize: 14, borderRadius: 12 }}
        >
          <Text>{t("gasless_vouch_cost")}</Text>
        </Alert>
      )}
      {props?.submission ? (
        <>
          <SubmissionDetailsCard
            submission={props.submission}
            contract={props.contract}
            vouchers={props.vouchers}
          />
          <SubmissionDetailsAccordion
            submission={props.submission}
            contract={props.contract}
          />
        </>
      ) : null}
    </>
  );
}

export const IdQuery = graphql`
  query IdQuery($id: ID!, $_id: [String!]) {
    contract(id: 0) {
      submissionDuration
      submissionBaseDeposit
      arbitratorExtraData

      ...submissionDetailsCardContract
      ...submissionDetailsAccordionContract
    }
    submission(id: $id) {
      name
      status
      registered
      submissionTime
      disputed
      ...submissionDetailsCardSubmission
      ...submissionDetailsAccordionSubmission
    }
    vouchers: submissions(where: { vouchees_contains: $_id, usedVouch: null }) {
      ...submissionDetailsCardVouchers
    }
  }
`;
