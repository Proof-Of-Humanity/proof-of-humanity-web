import {
  Box,
  Card,
  EthereumAccount,
  Flex,
  FundButton,
  Image,
  Link,
  Text,
  Video,
  useContract,
  useWeb3,
} from "@kleros/components";
import { User } from "@kleros/icons";
import { useMemo } from "react";
import {
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
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
      challengePeriodDuration
      ...deadlinesContract
    }
  `,
  submission: graphql`
    fragment submissionDetailsCardSubmission on Submission {
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
        arbitrator
        arbitratorExtraData
        lastStatusChange
        evidence(orderBy: creationTime, first: 1) {
          URI
        }
        challenges(orderBy: creationTime, first: 1) {
          disputeID
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

  const { lastStatusChange } = request;
  const {
    submissionBaseDeposit,
    submissionDuration,
    requiredNumberOfVouches,
    challengePeriodDuration,
  } = (contract = useFragment(
    submissionDetailsCardFragments.contract,
    contract
  ));

  const status = submissionStatusEnum.parse({ ...rest, submissionDuration });
  const { challenges } = request || {};

  const evidence = useEvidenceFile()(request.evidence[0].URI);
  const contributions = useMemo(
    () =>
      request.challenges[0].rounds[0].contributions.map((contribution) =>
        partyEnum.parse(contribution.values)
      ),
    [request]
  );

  const displayName =
    [evidence?.file.firstName, evidence?.file.lastName]
      .filter(Boolean)
      .join(" ") || name;

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

  const shareTitle =
    status === submissionStatusEnum.Vouching
      ? "Register and vouch for this profile on Proof Of Humanity."
      : "Check out this profile on Proof Of Humanity.";
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
        <Image
          sx={{ objectFit: "contain" }}
          variant="avatar"
          src={evidence?.file?.photo}
        />
        <Text
          sx={{
            fontSize: 2,
            fontWeight: "bold",
            marginY: 2,
          }}
        >
          {evidence instanceof Error
            ? "We are doing some maintenance work and will be online again soon."
            : evidence?.file?.name &&
              (name.replaceAll(/[^\s\w]/g, "") ===
              evidence.file.name.replaceAll(/[^\s\w]/g, "")
                ? evidence.file.name
                : "We are doing some maintenance work and will be online again soon.")}
        </Text>
        <Text sx={{ wordBreak: "break-word" }} count={2}>
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
        {challenges?.length > 0 && challenges[0].disputeID !== null && (
          <Flex>
            {challenges?.length > 1 ? "Disputes" : "Dispute"}
            {challenges.map(({ disputeID }, i) => (
              <Link
                key={i}
                newTab
                href={`https://court.kleros.io/cases/${disputeID}`}
                sx={{ marginLeft: 1 }}
              >
                # {disputeID}
              </Link>
            ))}
          </Flex>
        )}
        <Box sx={{ marginTop: "auto" }}>
          <Deadlines
            submission={submission}
            contract={contract}
            status={status}
          />
        </Box>
      </Flex>
      <Box sx={{ flex: 1, padding: 4 }}>
        <Flex sx={{ alignItems: "center", gap: 8 }}>
          <User />{" "}
          <Text as="span" sx={{ fontWeight: "bold" }}>
            {displayName}
          </Text>
        </Flex>
        <EthereumAccount
          diameter={16}
          address={id}
          sx={{
            marginBottom: 2,
            color: "text",
            fontWeight: "bold",
          }}
        />
        <Video url={evidence?.file?.video} />
        <UBICard
          submissionID={id}
          lastStatusChange={lastStatusChange}
          challengePeriodDuration={challengePeriodDuration}
          status={status}
        />
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
        <Flex sx={{ justifyContent: "flex-end" }}>
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
            hashtags={["kleros", "proofofhumanity"]}
          >
            <TwitterIcon size={32} />
          </TwitterShareButton>
        </Flex>
      </Box>
    </Card>
  );
}
