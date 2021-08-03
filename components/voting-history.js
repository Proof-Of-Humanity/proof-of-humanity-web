import { useMemo, useState } from "react";
import { Box, Flex } from "theme-ui";

import { createUseDataloaders } from "./archon-provider";
import Card from "./card";
import Select from "./select";
import Tabs, { Tab, TabList, TabPanel } from "./tabs";
import { useWeb3 } from "./web3-provider";

const { getRulingDescriptions: useRulingDescriptions, getVotes: useVotes } =
  createUseDataloaders({
    async getRulingDescriptions(
      {
        archon: {
          arbitrable: { getDispute, getMetaEvidence },
        },
      },
      arbitrableContractAddress,
      arbitratorContractAddress,
      disputeID
    ) {
      const { metaEvidenceID } = await getDispute(
        arbitrableContractAddress,
        arbitratorContractAddress,
        disputeID
      );
      const metaEvidence = await getMetaEvidence(
        arbitrableContractAddress,
        disputeID === String(560) ? String(2) : metaEvidenceID,
        {
          scriptParameters: {
            arbitrableContractAddress,
            arbitratorContractAddress,
            disputeID,
          },
          strictHashes: true,
        }
      );
      return metaEvidence.metaEvidenceJSON.rulingOptions.descriptions;
    },
    async getVotes({ web3 }, arbitrator, disputeID, appeal) {
      const klerosLiquid = web3.contracts.klerosLiquid.clone();
      klerosLiquid.options.address = arbitrator;
      const justifications = await fetch(
        "https://hgyxlve79a.execute-api.us-east-2.amazonaws.com/production/justifications",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: { network: web3.ETHNet.name, disputeID, appeal },
          }),
        }
      ).then((res) => res.json());
      return Promise.all(
        justifications.payload.justifications.Items.map(
          async ({
            voteID: { N: voteID },
            justification: { S: justification },
          }) => ({
            ruling: Number(
              (
                await klerosLiquid.methods
                  .getVote(disputeID, appeal, voteID)
                  .call()
              ).choice
            ),
            justification,
          })
        )
      );
    },
  });
function VotingHistoryTabPanel({
  arbitrable,
  arbitrator,
  challenge: { disputeID, lastRoundID },
}) {
  const [round, setRound] = useState({
    index: 0,
    toString() {
      return `Round: 0`;
    },
  });
  const [ruling, setRuling] = useState(0);

  const getRulingDescriptions = useRulingDescriptions();
  const rulingDescriptions =
    arbitrable && getRulingDescriptions(arbitrable, arbitrator, disputeID);

  const { web3 } = useWeb3();
  const getVotes = useVotes();
  const votes =
    web3.contracts?.klerosLiquid &&
    web3.ETHNet?.name &&
    getVotes(arbitrator, disputeID, round.index)?.filter(
      (vote) => vote.ruling === ruling
    );
  return (
    <>
      <Flex sx={{ marginBottom: 2 }}>
        <Select
          items={useMemo(
            () =>
              [...new Array(lastRoundID)].map((_, index) => ({
                index,
                toString() {
                  return `Round: ${index}`;
                },
              })),
            [lastRoundID]
          )}
          onChange={(value) => setRound(value)}
          value={round}
          label="Choose a round:"
        />
        {rulingDescriptions && (
          <Box sx={{ flex: 1, marginLeft: 2 }}>
            <Select
              items={rulingDescriptions}
              onChange={(value) => setRuling(rulingDescriptions.indexOf(value))}
              value={rulingDescriptions[ruling]}
              label="Choose a voting option:"
            />
          </Box>
        )}
      </Flex>
      {votes && votes.length === 0
        ? "No Votes"
        : votes?.map((vote, index) => (
            <Card
              key={index}
              header={`Justification #${index + 1}`}
              headerSx={{ fontWeight: "bold" }}
            >
              {vote.justification}
            </Card>
          ))}
    </>
  );
}
export default function VotingHistory({ challenges, arbitrable, arbitrator }) {
  challenges = challenges.filter(({ disputeID }) => disputeID !== null);
  return (
    <Tabs>
      <TabList>
        {challenges.map(({ id, reason: { startCase } }) => (
          <Tab key={id}>{startCase}</Tab>
        ))}
      </TabList>
      {challenges.map((challenge) => (
        <TabPanel key={challenge.id}>
          <VotingHistoryTabPanel
            arbitrable={arbitrable}
            arbitrator={arbitrator}
            challenge={challenge}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
}
