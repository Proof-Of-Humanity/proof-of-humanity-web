
import { useCallback } from "react";
import { useTranslation } from 'react-i18next'; 
import Head from "next/head";
import { useRouter } from "next/router";

import { useQuery, useWeb3, Link } from "@kleros/components";
import { Row, Col, Button, Space, Typography } from 'antd';
const { Title, Paragraph } = Typography;

import { NewSubmitProfileCard } from "./submit-profile";

export default function ProfileNew() {
  const { connect } = useWeb3();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { t, i18n } = useTranslation();

  const { props } = useQuery();
  const { web3 } = useWeb3();
  const account = accounts?.[0];

  const router = useRouter();
  const { query } = router;

  const reapply = query.reapply === "true";
  const registered = props?.submission?.registered ?? false;

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
          reapply={reapply && registered}
          afterSend={handleAfterSend}
          account={account}
          web3={web3}
        />
      </>
    );
  }


  return (
    
    <Row justify="center">
      <Col className="submit-profile-card" style={{textAlign: 'center'}} xs={{ span: 24 }} xl={{ span: 12 }}>
      <Space direction="vertical" size={1}>
        
          <Title level={2}>Create your Proof of Humanity profile</Title>
          <Title level={5}>You don&apos;t have a wallet connected to the website</Title>
          <Button type="primary" shape="round" className="button-orange"onClick={connect}>Connect an Ethereum Wallet</Button>
          <Paragraph>Don&apos;t have a wallet? Click <Link href="https://ethereum.org/en/wallets/find-wallet/" target="_blank" rel="noreferrer noopener">here</Link> to learn on how to create one!</Paragraph>
        
      </Space>
      </Col>
    </Row>
  );
}
