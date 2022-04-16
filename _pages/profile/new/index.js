
import { useCallback } from "react";
import { useTranslation, Trans } from 'react-i18next'; 
import Head from "next/head";
import { useRouter } from "next/router";
import { useQuery } from "relay-hooks";

import { useWeb3, Link } from "@kleros/components";
import { Row, Col, Button, Space, Typography, message } from 'antd';
const { Title, Paragraph } = Typography;

import { NewSubmitProfileCard } from "./submit-profile";
import { useEvidenceFile } from "data";

export default function ProfileNew() {
  const { connect } = useWeb3();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { t, i18n } = useTranslation();


  const { web3 } = useWeb3();
  const account = accounts?.[0].toLowerCase();

  const { props } = useQuery(newProfileQuery,{
    id:account
  });

  const router = useRouter();
  const { query } = router;

  const reapply = query.reapply === "true";
  const registered = props?.submission?.registered ?? false;

  const submissionDuration = Number(web3.contracts?.proofOfHumanity.methods.submissionDuration().call());

  const renewalPeriodDuration = Number(web3.contracts?.proofOfHumanity.methods.renewalPeriodDuration().call());

  const renewalTimestamp = (Number(props?.submission?.submissionTime) + (submissionDuration - renewalPeriodDuration)) * 1000;

  const canReapply = Date.now() > renewalTimestamp;
  //console.log("props",props)

    if(registered && !canReapply){
      message.error("You can't reapply yet", 5)
      router.push({
        pathname: "/profile/[id]",
        query: { id: account },
        asPath:`/profile/${account}`
      });
    }
  
    const fetchMetaEvidence = () =>{
      console.log(props?.contract)
      const evidence = useEvidenceFile()(props?.contract?.registrationMetaEvidence.URI);
      console.log(evidence?.fileURI)
      return evidence?.fileURI;      
    }
    const rules = fetchMetaEvidence();
    
  const handleAfterSend = useCallback(async () => {
    if (reapply)
      router.push({
        pathname: "/profile/[id]",
        query: { id: account },
      });
    await new Promise((r) => setTimeout(r, 3000));
    location.reload();
  }, [reapply, router, account]);

  // console.log('profile new', account, props);

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
    <Row justify="center">
      <Col className="submit-profile-card" style={{textAlign: 'center'}} xs={{ span: 24 }} xl={{ span: 12 }}>
      <Space direction="vertical" size={1}>
          <Title level={2}>{t("submit_profile_title")}</Title>
          <Title level={5}>{t("submit_profile_create_wallet")}</Title>
          <Button type="primary" shape="round" className="button-orange"onClick={connect}>{t("submit_profile_connect_wallet")}</Button>
          <Paragraph>
            <Trans 
            i18nKey="submit_profile_wallet_help" 
            t={t}
            components={[
              <Link href="https://ethereum.org/en/wallets/find-wallet/" target="_blank" rel="noreferrer noopener"></Link>
            ]} />
          </Paragraph>
      </Space>
      </Col>
    </Row>
  );
}
export const newProfileQuery = graphql`
query newProfileQuery($id: ID!) {
  
  contract(id: 0) {
    submissionDuration
    submissionBaseDeposit
    arbitratorExtraData
    renewalTime
    registrationMetaEvidence{
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
