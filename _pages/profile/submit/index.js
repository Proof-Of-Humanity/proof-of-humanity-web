import { LoadingOutlined } from "@ant-design/icons";
import { Link, useWeb3 } from "@kleros/components";
import { Button, Col, Row, Space, Typography, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { graphql, useQuery } from "relay-hooks";

const { Title, Paragraph } = Typography;

import { NewSubmitProfileCard } from "./submit-profile";

import { useEvidenceFile } from "data";

const submitProfileQuery = graphql`
  query submitProfileQuery($id: ID!) {
    contract(id: 0) {
      submissionDuration
      submissionBaseDeposit
      arbitratorExtraData
      renewalTime
      registrationMetaEvidence {
        id
        URI
      }
    }
    submission(id: $id) {
      name
      status
      registered
      submissionTime
    }
  }
`;

export default function ProfileNew() {
  const { connect } = useWeb3();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { t, i18n } = useTranslation();

  const { web3 } = useWeb3();
  const account = accounts?.[0]?.toLowerCase();

  const { props } = useQuery(submitProfileQuery, {
    id: account,
  });

  const router = useRouter();
  const { query } = router;

  const reapply = query.reapply === "true";
  const submission = props?.submission;

  const [canReapply, setCanReapply] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (canReapply === null) {
      // Is this needed?
      Promise.all([
        web3.contracts?.proofOfHumanity.methods.submissionDuration().call(),
        web3.contracts?.proofOfHumanity.methods.renewalPeriodDuration().call(),
      ]).then(([submissionDuration, renewalPeriodDuration]) => {
        const renewalTimestamp =
          (Number(props?.submission?.submissionTime) +
            (submissionDuration - renewalPeriodDuration)) *
          1000;
        setCanReapply(Date.now() > renewalTimestamp);
      });
    }
  });

  useEffect(() => {
    // console.log(submission?.registered);
    if (submission?.registered && canReapply === false) {
      message.error("You can't reapply yet", 5);
      router.push({ pathname: "/profile/[id]", query: { id: account } });
    } else if (submission === null || !account) {
      setLoading(false);
    }
  }, [submission, canReapply, router, account]);

  // console.log(props?.contract)
  const evidence = useEvidenceFile()(
    props?.contract?.registrationMetaEvidence.URI
  );
  // console.log(evidence?.fileURI)
  const rules = evidence?.fileURI;

  const handleAfterSend = useCallback(async () => {
    if (reapply) {
      router.push({
        pathname: "/profile/[id]",
        query: { id: account },
      });
    }
    await new Promise((r) => setTimeout(r, 3000));
    location.reload();
  }, [reapply, router, account]);

  // console.log('profile new', account, props);

  // console.log('isLoading', isLoading);
  if (isLoading) {
    return (
      <Row justify="center">
        <LoadingOutlined style={{ fontSize: 60 }} spin />
      </Row>
    );
  }

  if (account) {
    return (
      <>
        <Head>
          <title>{t("submit_profile")} | Proof of Humanity</title>
          <meta httpEquiv="cache-control" content="no-cache" />
          <meta httpEquiv="expires" content={0} />
          <meta httpEquiv="pragma" content="no-cache" />
        </Head>

        <NewSubmitProfileCard
          i18n={i18n}
          contract={props?.contract}
          submission={props?.submission}
          reapply={canReapply}
          afterSend={handleAfterSend}
          account={account}
          web3={web3}
          rules={rules}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t("submit_profile")} | Proof of Humanity</title>
        <meta httpEquiv="cache-control" content="no-cache" />
        <meta httpEquiv="expires" content={0} />
        <meta httpEquiv="pragma" content="no-cache" />
      </Head>

      <Row justify="center">
        <Col
          className="submit-profile-card"
          style={{ textAlign: "center" }}
          xs={{ span: 24 }}
          xl={{ span: 12 }}
        >
          <Space direction="vertical" size={1}>
            <Title level={2}>{t("submit_profile_title")}</Title>
            <Title level={5}>{t("submit_profile_create_wallet")}</Title>
            <Button
              type="primary"
              shape="round"
              className="button-orange"
              onClick={connect}
            >
              {t("submit_profile_connect_wallet")}
            </Button>
            <Paragraph>
              <Trans
                i18nKey="submit_profile_wallet_help"
                t={t}
                components={[
                  <Link
                    key="1"
                    href="https://ethereum.org/en/wallets/find-wallet/"
                    target="_blank"
                    rel="noreferrer noopener"
                  />,
                ]}
              />
            </Paragraph>
          </Space>
        </Col>
      </Row>
    </>
  );
}
