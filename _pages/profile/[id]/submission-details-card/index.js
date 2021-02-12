import {
  Box,
  Card,
  Flex,
  FundButton,
  Image,
  NextETHLink,
  Text,
  Video,
  useContract,
  useWeb3,
} from "@kleros/components";
import { Ether, User } from "@kleros/icons";
import { useMemo } from "react";
import { graphql, useFragment } from "relay-hooks";

import Deadlines from "./deadlines";
import UBICard from "./ubi-card";
import VouchButton from "./vouch-button";
import Voucher from "./voucher";

import { partyEnum, submissionStatusEnum, useEvidenceFile } from "data";

const submissionDetailsCardFragments = {
  contract: graphql`
    fragment submissionDetailsCardContract on Contract {
      submissionBaseDeposit
      submissionDuration
      requiredNumberOfVouches
      ...deadlinesContract
    }
  `,
  submission: graphql`
    fragment submissionDetailsCardSubmission on Submission {
      id
      status
      registered
      name
      disputed
      requests(
        orderBy: creationTime
        orderDirection: desc
        first: 1
        where: { registration: true }
      ) {
        arbitrator
        arbitratorExtraData
        evidence(orderBy: creationTime, first: 1) {
          URI
        }
        challenges(orderBy: creationTime, first: 1) {
          rounds(orderBy: creationTime, first: 1) {
            contributions {
              values
            }
          }
        }
      }
      ...deadlinesSubmission
    }
  `,
  vouchers: graphql`
    fragment submissionDetailsCardVouchers on Submission @relay(plural: true) {
      id
      submissionTime
      ...voucher
    }
  `,
};
export default function SubmissionDetailsCard({
  submission,
  contract,
  vouchers,
}) {
  const {
    requests: [request],
    id,
    name,
    ...rest
  } = (submission = useFragment(
    submissionDetailsCardFragments.submission,
    submission
  ));
  const status = submissionStatusEnum.parse({ ...rest });

  const evidence = useEvidenceFile()(request.evidence[0].URI);
  const contributions = useMemo(
    () =>
      request.challenges[0].rounds[0].contributions.map((contribution) =>
        partyEnum.parse(contribution.values)
      ),
    [request]
  );

  const [arbitrationCost] = useContract(
    "klerosLiquid",
    "arbitrationCost",
    useMemo(
      () => ({
        address: request.arbitrator,
        args: [request.arbitratorExtraData],
      }),
      [request]
    )
  );
  const { web3 } = useWeb3();
  const {
    submissionBaseDeposit,
    submissionDuration,
    requiredNumberOfVouches,
  } = (contract = useFragment(
    submissionDetailsCardFragments.contract,
    contract
  ));
  const totalCost = useMemo(
    () => arbitrationCost?.add(web3.utils.toBN(submissionBaseDeposit)),
    [arbitrationCost, web3.utils, submissionBaseDeposit]
  );
  const totalContribution = useMemo(
    () =>
      contributions.reduce(
        (acc, { Requester }) => acc.add(web3.utils.toBN(Requester)),
        web3.utils.toBN(0)
      ),
    [contributions, web3.utils]
  );

  const registeredVouchers = useFragment(
    submissionDetailsCardFragments.vouchers,
    vouchers
  ).filter(
    ({ submissionTime }) =>
      Date.now() / 1000 - submissionTime < submissionDuration
  );
  return (
    <Card
      mainSx={{
        alignItems: "stretch",
        flexDirection: ["column", null, null, "row"],
        padding: 0,
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          backgroundColor: "muted",
          flexDirection: "column",
          maxWidth: [null, null, null, 300],
          paddingX: 3,
          paddingY: 4,
          textAlign: "center",
        }}
      >
        <Image variant="avatar" src={evidence?.file?.photo} />
        <Text
          sx={{
            fontSize: 2,
            fontWeight: "bold",
            marginY: 2,
          }}
        >
          {evidence instanceof Error
            ? "Tampered Data, Reject"
            : evidence?.file?.name &&
              (name.replaceAll(/[^\s\w]/g, "") ===
              evidence.file.name.replaceAll(/[^\s\w]/g, "")
                ? evidence.file.name
                : "Tampered Data, Reject")}
        </Text>
        <Text count={2}>
          {evidence?.file ? evidence.file.bio || " " : null}
        </Text>
        <Box sx={{ marginY: 2, width: "100%" }}>
          {status === submissionStatusEnum.Vouching && (
            <>
              {totalCost?.gt(totalContribution) && (
                <FundButton
                  totalCost={totalCost}
                  totalContribution={totalContribution}
                  contract="proofOfHumanity"
                  method="fundSubmission"
                  args={[id]}
                >
                  Fund Submission
                </FundButton>
              )}
              <VouchButton submissionID={id} />
            </>
          )}
        </Box>
        <Flex sx={{ width: "100%" }}>
          <Box
            sx={{
              borderRightColor: "text",
              borderRightStyle: "solid",
              borderRightWidth: 1,
              flex: 1,
              marginBottom: 3,
              paddingX: 1,
            }}
          >
            <Text>Vouchers</Text>
            <Text sx={{ fontWeight: "bold", paddingX: 1 }}>
              {String(registeredVouchers.length)}/{requiredNumberOfVouches}
            </Text>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text>Deposit</Text>
            <Text sx={{ fontWeight: "bold" }}>
              {totalCost &&
                `${Math.floor(
                  totalContribution
                    .mul(web3.utils.toBN(100))
                    .div(totalCost)
                    .toNumber()
                )}%`}
            </Text>
          </Box>
        </Flex>
        <Box sx={{ marginTop: "auto" }}>
          <Deadlines
            submission={submission}
            contract={contract}
            status={status}
          />
        </Box>
      </Flex>
      <Box sx={{ flex: 1, padding: 4 }}>
        <Box>
          <User />{" "}
          <Text as="span" sx={{ fontWeight: "bold" }}>
            {evidence?.file &&
              `${evidence.file.firstName} ${evidence.file.lastName}`}
          </Text>
        </Box>
        <Text variant="clipped" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          <Ether /> <NextETHLink address={id}>{id}</NextETHLink>
        </Text>
        <Video url={evidence?.file?.video} />
        <UBICard submissionID={id} />
        <Text
          sx={{
            marginTop: 2,
            marginBottom: 1,
            opacity: 0.45,
          }}
        >
          Vouched by:
        </Text>
        <Flex>
          {registeredVouchers.map((voucher) => (
            <Voucher key={voucher.id} submission={voucher} />
          ))}
        </Flex>
      </Box>
    </Card>
  );
}
