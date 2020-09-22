import { useMemo } from "react";

import Card from "./card";
import FundButton from "./fund-button";
import Grid from "./grid";
import { NextETHLink } from "./next-router";
import Progress from "./progress";
import Tabs, { Tab, TabList, TabPanel } from "./tabs";
import Text from "./text";
import TimeAgo from "./time-ago";
import { useContract, useWeb3 } from "./web3-provider";

function AppealTabPanelCard({
  address,
  label,
  cost,
  paidFees,
  hasPaid,
  deadline,
  reward,
  contract,
  args,
}) {
  const { web3 } = useWeb3();
  const card = (
    <Card mainSx={{ alignItems: "flex-start", flexDirection: "column" }}>
      <NextETHLink address={address}>{address}</NextETHLink>
      <Text sx={{ marginBottom: 3 }}>
        {label && `Previous round ${label}.`}
      </Text>
      <Text
        sx={{
          fontWeight: "bold",
          marginBottom: 1,
          textAlign: "center",
          width: "100%",
        }}
      >
        {cost && `Total Deposit Required:  ${web3.utils.fromWei(cost)}`}
      </Text>
      <Progress
        sx={{ marginBottom: 1 }}
        value={paidFees}
        max={cost?.toString()}
      />
      <Text sx={{ marginBottom: 3 }}>
        {hasPaid
          ? "Fully funded."
          : deadline &&
            (deadline.eq(web3.utils.toBN(0)) ? (
              "Previous round is still in progress."
            ) : (
              <TimeAgo datetime={deadline * 1000} />
            ))}
      </Text>
      <Text sx={{ fontWeight: "bold" }}>{reward && `Reward ${reward}%`}</Text>
    </Card>
  );
  if (
    !hasPaid &&
    cost &&
    deadline &&
    !deadline.eq(web3.utils.toBN(0)) &&
    deadline.lt(web3.utils.toBN(Date.now() / 1000))
  )
    return (
      <FundButton
        totalCost={cost}
        totalContribution={web3.utils.toBN(paidFees)}
        contract={contract}
        method="fundAppeal"
        args={args}
      >
        {card}
      </FundButton>
    );
  return card;
}
function AppealTabPanel({
  sharedStakeMultiplier,
  winnerStakeMultiplier,
  loserStakeMultiplier,
  arbitrator,
  challenge: {
    disputeID,
    parties: [party1, party2],
    rounds: [{ paidFees, hasPaid }],
    id,
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
    label: "undecided",
    reward: sharedStakeMultiplier.div(sharedStakeMultiplier).mul(hundred),
  };
  const winner = {
    label: "winner",
    reward: loserStakeMultiplier.div(winnerStakeMultiplier).mul(hundred),
  };
  const loser = {
    label: "loser",
    reward: winnerStakeMultiplier.div(loserStakeMultiplier).mul(hundred),
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
    useMemo(() => ({ address: arbitrator, args: [disputeID] }), [
      arbitrator,
      disputeID,
    ])
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
    useMemo(() => ({ address: arbitrator, args: [disputeID] }), [
      arbitrator,
      disputeID,
    ])
  );
  currentRuling = currentRuling?.toNumber();
  return (
    <>
      <Text sx={{ marginBottom: 2 }}>
        Help fund a side’s appeal fees to win part of the other side’s deposit
        when your side ultimately wins. If only one side manages to fund their
        fees, it automatically wins.
      </Text>
      <Grid gap={2} columns={2}>
        <AppealTabPanelCard
          address={party1}
          {...[undecided, winner, loser][currentRuling]}
          paidFees={paidFees[0]}
          hasPaid={hasPaid[0]}
          contract={contract}
          args={[...args, id, 1]}
        />
        <AppealTabPanelCard
          address={party2}
          {...[undecided, loser, winner][currentRuling]}
          paidFees={paidFees[1]}
          hasPaid={hasPaid[1]}
          contract={contract}
          args={[...args, id, 2]}
        />
      </Grid>
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
