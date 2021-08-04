import { useMemo } from "react";
import {
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import { Box, Flex } from "theme-ui";

import Alert from "./alert";
import Card from "./card";
import FundButton from "./fund-button";
import Grid from "./grid";
import Identicon from "./identicon";
import { NextETHLink } from "./next-router";
import Progress from "./progress";
import Tabs, { Tab, TabList, TabPanel } from "./tabs";
import Text from "./text";
import TimeAgo from "./time-ago";
import { useContract, useWeb3 } from "./web3-provider";

function isWinnerAndOpposingPartyDidntPay(
  web3,
  isWinner,
  oppositeHasPaid,
  loserDeadline
) {
  const currentTime = web3.utils.toBN(Math.floor(Date.now() / 1000));
  if (isWinner && !oppositeHasPaid && loserDeadline?.lt(currentTime))
    return true;

  return false;
}

function AppealTabPanelCard({
  address,
  label,
  cost,
  paidFees,
  hasPaid,
  oppositeHasPaid,
  loserDeadline,
  isWinner,
  deadline,
  reward,
  contract,
  args,
  partyLabel,
}) {
  const { web3 } = useWeb3();
  const totalContribution = web3.utils.toBN(paidFees);
  const card = (
    <Card
      sx={{ minWidth: 480 }}
      header={
        <>
          <Identicon address={address} />
          <Box sx={{ marginLeft: 2 }}>
            <NextETHLink address={address}>
              {`${address.slice(0, 5)}...${address.slice(-3)}`} - {partyLabel}
            </NextETHLink>
            <Text>{label}</Text>
          </Box>
        </>
      }
      headerSx={{ justifyContent: "flex-start" }}
      mainSx={{ alignItems: "flex-start", flexDirection: "column" }}
    >
      <Text
        sx={{
          fontWeight: "bold",
          marginBottom: 1,
          textAlign: "center",
          width: "100%",
        }}
      >
        {cost &&
          `${totalContribution
            .mul(web3.utils.toBN(100))
            .div(cost)}% Funded / ${web3.utils.fromWei(
            totalContribution
          )} ETH of ${web3.utils.fromWei(cost)} ETH`}
      </Text>
      <Progress
        sx={{
          borderRadius: 30,
          color: "success",
          height: 8,
          marginBottom: 1,
        }}
        value={paidFees}
        max={cost?.toString()}
      />
      <Text sx={{ marginBottom: 3 }}>
        {hasPaid ? (
          "Fully funded."
        ) : isWinnerAndOpposingPartyDidntPay(
            web3,
            isWinner,
            oppositeHasPaid,
            loserDeadline
          ) ? (
          "This side already won, opposing party did not fund the appeal."
        ) : deadline && deadline.eq(web3.utils.toBN(0)) ? (
          "Previous round is still in progress."
        ) : (
          <TimeAgo datetime={deadline * 1000} />
        )}
      </Text>
      <Alert title="For Contributors">
        {reward &&
          `If this side wins, you get back your contribution and a ${reward}%
        reward.`}
      </Alert>
      {!hasPaid &&
        !isWinnerAndOpposingPartyDidntPay(
          web3,
          isWinner,
          oppositeHasPaid,
          loserDeadline
        ) &&
        cost &&
        deadline &&
        !deadline.eq(web3.utils.toBN(0)) &&
        deadline.gt(web3.utils.toBN(Math.floor(Date.now() / 1000))) && (
          <FundButton
            totalCost={cost}
            totalContribution={totalContribution}
            contract={contract}
            method="fundAppeal"
            args={args}
          >
            Contribute
          </FundButton>
        )}
    </Card>
  );

  return card;
}
function AppealTabPanel({
  sharedStakeMultiplier,
  winnerStakeMultiplier,
  loserStakeMultiplier,
  arbitrator,
  challenge: {
    challengeID,
    disputeID,
    parties: [party1, party2],
    rounds: [{ paidFees, hasPaid }],
  },
  arbitratorExtraData,
  contract,
  args,
}) {
  const { web3 } = useWeb3();
  sharedStakeMultiplier = web3.utils.toBN(sharedStakeMultiplier);
  winnerStakeMultiplier = web3.utils.toBN(winnerStakeMultiplier);
  loserStakeMultiplier = web3.utils.toBN(loserStakeMultiplier);
  const divisor = web3.utils.toBN(10000);
  const hundred = web3.utils.toBN(100);
  const undecided = {
    label: "Previous round undecided.",
    reward: sharedStakeMultiplier.mul(hundred).div(sharedStakeMultiplier),
  };
  const winner = {
    label: "Previous round winner.",
    reward: loserStakeMultiplier.mul(hundred).div(winnerStakeMultiplier),
  };
  const loser = {
    label: "Previous round loser.",
    reward: winnerStakeMultiplier.mul(hundred).div(loserStakeMultiplier),
  };

  const [appealCost] = useContract(
    "klerosLiquid",
    "appealCost",
    useMemo(
      () => ({ address: arbitrator, args: [disputeID, arbitratorExtraData] }),
      [arbitrator, disputeID, arbitratorExtraData]
    )
  );
  if (appealCost) {
    undecided.cost = appealCost.add(
      appealCost.mul(sharedStakeMultiplier).div(divisor)
    );
    winner.cost = appealCost.add(
      appealCost.mul(winnerStakeMultiplier).div(divisor)
    );
    loser.cost = appealCost.add(
      appealCost.mul(loserStakeMultiplier).div(divisor)
    );
  }

  const [appealPeriod] = useContract(
    "klerosLiquid",
    "appealPeriod",
    useMemo(
      () => ({ address: arbitrator, args: [disputeID] }),
      [arbitrator, disputeID]
    )
  );
  if (appealPeriod) {
    undecided.deadline = appealPeriod.end;
    winner.deadline = appealPeriod.end;
    loser.deadline = appealPeriod.start.add(
      appealPeriod.end.sub(appealPeriod.start).div(web3.utils.toBN(2))
    );
  }

  let [currentRuling] = useContract(
    "klerosLiquid",
    "currentRuling",
    useMemo(
      () => ({ address: arbitrator, args: [disputeID] }),
      [arbitrator, disputeID]
    )
  );
  currentRuling = currentRuling?.toNumber();
  const shareTitle = `Crowdfunding Appeal Fees for ${party1} vs ${party2}.`;
  return (
    <>
      <Text sx={{ marginBottom: 2 }}>
        Help fund a side’s appeal fees to win part of the other side’s deposit
        when your side ultimately wins. If only one side manages to fund their
        fees, it automatically wins.
      </Text>
      <Grid sx={{ marginBottom: 3 }} gap={2} columns={[1, 1, 1, 2]}>
        <AppealTabPanelCard
          address={party1}
          {...[undecided, winner, loser][currentRuling]}
          paidFees={paidFees[1]}
          hasPaid={hasPaid[0]}
          oppositeHasPaid={hasPaid[1]}
          loserDeadline={loser.deadline}
          isWinner={currentRuling === 1}
          contract={contract}
          args={[...args, challengeID, 1]}
          partyLabel="Submitter"
        />
        <AppealTabPanelCard
          address={party2}
          {...[undecided, loser, winner][currentRuling]}
          paidFees={paidFees[2]}
          hasPaid={hasPaid[1]}
          oppositeHasPaid={hasPaid[0]}
          loserDeadline={loser.deadline}
          isWinner={currentRuling === 2}
          contract={contract}
          args={[...args, challengeID, 2]}
          partyLabel="Challenger"
        />
      </Grid>
      <Flex sx={{ justifyContent: "center" }}>
        <RedditShareButton url={location.href} title={shareTitle}>
          <RedditIcon size={32} />
        </RedditShareButton>
        <TelegramShareButton url={location.href} title={shareTitle}>
          <TelegramIcon size={32} />
        </TelegramShareButton>
        <TwitterShareButton
          url={location.href}
          title={shareTitle}
          via="Kleros_io"
          hashtags={["kleros", "appeals"]}
        >
          <TwitterIcon size={32} />
        </TwitterShareButton>
      </Flex>
    </>
  );
}
export default function Appeal({
  challenges,
  sharedStakeMultiplier,
  winnerStakeMultiplier,
  loserStakeMultiplier,
  arbitrator,
  arbitratorExtraData,
  contract,
  args,
}) {
  return (
    <Tabs>
      <TabList>
        {challenges.map(({ id, reason: { startCase } }) => (
          <Tab key={id}>{startCase}</Tab>
        ))}
      </TabList>
      {challenges.map((challenge) => (
        <TabPanel key={challenge.id}>
          <AppealTabPanel
            sharedStakeMultiplier={sharedStakeMultiplier}
            winnerStakeMultiplier={winnerStakeMultiplier}
            loserStakeMultiplier={loserStakeMultiplier}
            arbitrator={arbitrator}
            challenge={challenge}
            arbitratorExtraData={arbitratorExtraData}
            contract={contract}
            args={args}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
}
