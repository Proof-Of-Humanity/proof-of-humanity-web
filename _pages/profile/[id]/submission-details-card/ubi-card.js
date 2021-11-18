/* eslint-disable jsx-a11y/accessible-emoji */
import {
  Alert,
  Button,
  Card,
  Flex,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { UBI } from "@kleros/icons";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { graphql, useQuery } from "relay-hooks";

import { submissionStatusEnum } from "data";
import ProofOfHumanityAbi from "subgraph/abis/proof-of-humanity";
import UBIAbi from "subgraph/abis/ubi";
import { UBIAddress, address as pohAddress } from "subgraph/config";

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function AccruedUBI({
  web3,
  accruedPerSecond,
  currentBalanceOf,
  registered,
  ...rest
}) {
  const [, rerender] = useReducer(() => ({}), {});
  const [updatedBalance, setUpdatedBalance] = useState(currentBalanceOf);
  useInterval(() => {
    if (currentBalanceOf && accruedPerSecond && registered)
      setUpdatedBalance((previous) => {
        if (previous) return previous.add(accruedPerSecond);
        return currentBalanceOf.add(accruedPerSecond);
      });

    rerender();
  }, 1000);

  if (
    !registered &&
    currentBalanceOf &&
    currentBalanceOf.lte(web3.utils.toBN(0))
  )
    return <Text {...rest}>0 UBI</Text>;

  return (
    <Text {...rest}>
      {updatedBalance
        ? web3.utils.fromWei(updatedBalance).slice(0, 6)
        : currentBalanceOf &&
          web3.utils.fromWei(currentBalanceOf).slice(0, 6)}{" "}
      UBI
    </Text>
  );
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getVouchCallsElegibleUsers(
  pohInstance,
  requiredNumberOfVouches,
  offChainVouches,
  onChainVouches,
  count = 1
) {
  const users = [...offChainVouches, ...onChainVouches];

  // Due to race conditions of transactions, there
  // is a chance that resources are wasted trying to advance the same user.
  // We can decrease this probability by shuffling the queue.
  shuffle(users);

  const toVouchCalls = [];
  for (const user of users) {
    if (toVouchCalls.length >= count) break;

    const [
      // eslint-disable-next-line prefer-const
      userSubmission,
      ...voucherDatas
    ] = await Promise.all([
      pohInstance.methods.getSubmissionInfo(user.submissionId).call(),
      ...user?.vouchers.map(async (voucher) => ({
        submissionInfo: await pohInstance.methods
          .getSubmissionInfo(voucher)
          .call(),
        isVouchActive: await pohInstance.methods
          .vouches(voucher, user.submissionId)
          .call(),
      })),
    ]);

    const validVouches = voucherDatas.flatMap((voucherData, i) =>
      !voucherData.submissionInfo.hasVouched &&
      voucherData.submissionInfo.registered &&
      (user.signatures || voucherData.isVouchActive) &&
      (!user.signatures || user.expirationTimestamps[i] > Date.now() / 1000)
        ? [i]
        : []
    );

    if (
      validVouches.length < requiredNumberOfVouches ||
      Number(userSubmission.status) !== 1
    )
      continue;

    const [latestRequest, round] = await Promise.all([
      pohInstance.methods
        .getRequestInfo(
          user.submissionId,
          Number(userSubmission.numberOfRequests) - 1
        )
        .call(),
      pohInstance.methods
        .getRoundInfo(
          user.submissionId,
          Number(userSubmission.numberOfRequests) - 1,
          0,
          0
        )
        .call(),
    ]);

    if (latestRequest.disputed || Number(round.sideFunded) !== 1) continue;

    if (user.signatures) {
      const validSignatures = validVouches.map((i) => user.signatures[i]);
      const validExpirationTimestamps = validVouches.map(
        (i) => user.expirationTimestamps[i]
      );
      toVouchCalls.push(
        pohInstance.methods
          .changeStateToPending(
            user.submissionId,
            [],
            validSignatures,
            validExpirationTimestamps
          )
          .encodeABI()
      );
    } else {
      const validVouchers = validVouches.map((i) => user?.vouchers[i]);
      toVouchCalls.push(
        pohInstance.methods
          .changeStateToPending(user.submissionId, validVouchers, [], [])
          .encodeABI()
      );
    }
  }

  return toVouchCalls;
}

export default function UBICard({
  submissionID,
  lastStatusChange,
  challengePeriodDuration,
  status,
  registeredVouchers,
  firstRoundFullyFunded,
}) {
  const { web3 } = useWeb3();
  const [, rerender] = useReducer(() => ({}), {});
  const [requiredNumberOfVouchesBN] = useContract(
    "proofOfHumanity",
    "requiredNumberOfVouches"
  );
  const requiredNumberOfVouches = useMemo(
    () => Number(requiredNumberOfVouchesBN),
    [requiredNumberOfVouchesBN]
  );
  const { props: vouchesReceivedQuery } = useQuery(
    graphql`
      query ubiCardQuery($id: ID!, $vouchesReceivedLength: BigInt!) {
        submission(id: $id) {
          vouchesReceived {
            id
          }
        }
        submissions(
          first: 100
          where: {
            status: Vouching
            vouchesReceivedLength_gte: $vouchesReceivedLength
          }
          orderBy: submissionTime
          orderDirection: asc
        ) {
          id
          vouchesReceived {
            id
          }
        }
      }
    `,
    { id: submissionID, vouchesReceivedLength: requiredNumberOfVouches }
  );

  const [lastMintedSecond, , lastMintedSecondStatus, reCallAccruedSince] =
    useContract(
      "UBI",
      "accruedSince",
      useMemo(() => ({ args: [submissionID] }), [submissionID])
    );
  const [currentBalanceOf] = useContract(
    "UBI",
    "balanceOf",
    useMemo(() => ({ args: [submissionID] }), [submissionID])
  );
  const [registered] = useContract(
    "proofOfHumanity",
    "isRegistered",
    useMemo(() => ({ args: [submissionID] }), [submissionID])
  );
  const {
    send: changeStateToPendingSend,
    loading: changeStateToPendingSendLoading,
  } = useContract("proofOfHumanity", "changeStateToPending");
  const [accruedPerSecond] = useContract("UBI", "accruedPerSecond");

  const { send: batchSend } = useContract("transactionBatcher", "batchSend");
  const { send: reportRemoval, loading: reportRemovalLoading } = useContract(
    "UBI",
    "reportRemoval"
  );
  const { send: startAccruing, loading: startAccruingLoading } = useContract(
    "UBI",
    "startAccruing"
  );

  const pohInstance = useMemo(() => {
    if (!ProofOfHumanityAbi || !pohAddress) return;
    return new web3.eth.Contract(ProofOfHumanityAbi, pohAddress);
  }, [web3.eth.Contract]);

  const ubiInstance = useMemo(() => {
    if (!UBIAbi || !UBIAddress) return;
    return new web3.eth.Contract(UBIAbi, UBIAddress);
  }, [web3.eth.Contract]);

  const challengeTimeRemaining =
    (Number(lastStatusChange) + Number(challengePeriodDuration)) * 1000 -
    Date.now();

  const [fetchingElegible, setFetchingElegible] = useState(false);
  const { submissions } = vouchesReceivedQuery || {};
  const registerAndAdvanceOthers = useCallback(async () => {
    if (
      !pohInstance ||
      !submissionID ||
      !requiredNumberOfVouches ||
      !submissions
    )
      return;

    setFetchingElegible(true);
    const { vouches: offChainVouches } = await (
      await fetch(
        `${
          process.env.NEXT_PUBLIC_VOUCH_DB_URL
        }/vouch/search?minVouchers=${Number(requiredNumberOfVouches)}`
      )
    ).json();

    const onChainVouches = submissions.map((s) => ({
      submissionId: s.id,
      vouchers: s.vouchesReceived.map((v) => v.id),
    }));
    const toVouchCalls = await getVouchCallsElegibleUsers(
      pohInstance,
      requiredNumberOfVouches,
      offChainVouches,
      onChainVouches,
      2
    );

    setFetchingElegible(false);
    const executeRequestCall = pohInstance.methods
      .executeRequest(submissionID)
      .encodeABI();
    const startAccruingCall = ubiInstance.methods
      .startAccruing(submissionID)
      .encodeABI();

    batchSend(
      [
        pohAddress,
        UBIAddress,
        ...new Array(toVouchCalls.length).fill(pohAddress),
      ],
      [
        web3.utils.toBN(0),
        web3.utils.toBN(0),
        ...new Array(toVouchCalls.length).fill(web3.utils.toBN(0)),
      ],
      [executeRequestCall, startAccruingCall, ...toVouchCalls],
      { gasLimit: 310000 }
    ).then(reCallAccruedSince);
  }, [
    batchSend,
    pohInstance,
    reCallAccruedSince,
    requiredNumberOfVouches,
    submissionID,
    submissions,
    ubiInstance.methods,
    web3.utils,
  ]);

  // This counts how many vouches the profile received, but
  // that are locked on another submission.
  const [queuedVouches, setQueuedVouches] = useState(new Set());

  // Gasless vouches.
  const [ownValidVouches, setOwnValidVouches] = useState([]);
  useEffect(() => {
    if (!submissionID) return;
    (async () => {
      const user = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/search?submissionId=${submissionID}`
        )
      ).json();

      const validVouches = { signatures: [], expirationTimestamps: [] };

      if (!user || !user.vouches) return;
      if (user?.vouches?.length === 0) return;
      const vouches = user?.vouches[0];
      const { submissionDuration } = await pohInstance.methods
        .submissionDuration()
        .call();

      for (let i = 0; i < vouches.vouchers.length; i++) {
        if (validVouches.signatures.length >= requiredNumberOfVouches) break;

        const {
          hasVouched,
          registered: voucherRegistered,
          submissionTime,
        } = await pohInstance.methods
          .getSubmissionInfo(vouches.vouchers[i])
          .call();

        if (
          !voucherRegistered ||
          Date.now() / 1000 - submissionTime > submissionDuration
        )
          continue;
        if (vouches.expirationTimestamps[i] < Date.now() / 1000) continue;

        if (!hasVouched) {
          validVouches.signatures.push(vouches.signatures[i]);
          validVouches.expirationTimestamps.push(
            vouches.expirationTimestamps[i]
          );
        } else {
          setQueuedVouches((previous) => previous.add(vouches.vouchers[i]));
          rerender();
        }
      }
      if (validVouches.signatures.length === 0) return;
      setOwnValidVouches(validVouches);
    })();
  }, [
    pohInstance,
    requiredNumberOfVouches,
    status.key,
    submissionID,
    vouchesReceivedQuery,
  ]);

  const { submission } = vouchesReceivedQuery || {};
  const { vouchesReceived } = submission || {};
  const [availableOnchainVouches, setAvailableOnchainVouches] = useState([]);
  useEffect(() => {
    if (!vouchesReceived || !pohInstance) return;
    (async () => {
      const onChainVouches = [];
      const { submissionDuration } = await pohInstance.methods
        .submissionDuration()
        .call();

      for (const vouchReceived of vouchesReceived) {
        if (onChainVouches.length >= requiredNumberOfVouches) break;

        const {
          hasVouched,
          registered: voucherRegistered,
          submissionTime,
        } = await pohInstance.methods
          .getSubmissionInfo(vouchReceived.id)
          .call();

        if (
          !voucherRegistered ||
          Date.now() / 1000 - submissionTime > submissionDuration
        )
          continue;

        const { isVouchActive } = await pohInstance.methods
          .vouches(vouchReceived.id, submissionID)
          .call();
        if (!isVouchActive) continue;

        if (!hasVouched) onChainVouches.push(vouchReceived.id);
        else setQueuedVouches((previous) => previous.add(vouchReceived.id));
      }
      setAvailableOnchainVouches(onChainVouches);
    })();
  }, [pohInstance, requiredNumberOfVouches, vouchesReceived, submissionID]);

  const advanceToPending = useCallback(() => {
    if (
      !ownValidVouches &&
      (!availableOnchainVouches || availableOnchainVouches.length === 0)
    )
      return;

    if (ownValidVouches?.signatures?.length >= requiredNumberOfVouches)
      changeStateToPendingSend(
        submissionID,
        [],
        ownValidVouches.signatures,
        ownValidVouches.expirationTimestamps
      ).then(reCallAccruedSince);
    else if (availableOnchainVouches.length >= requiredNumberOfVouches)
      changeStateToPendingSend(
        submissionID,
        availableOnchainVouches,
        [],
        []
      ).then(reCallAccruedSince);
  }, [
    availableOnchainVouches,
    changeStateToPendingSend,
    ownValidVouches,
    reCallAccruedSince,
    requiredNumberOfVouches,
    submissionID,
  ]);

  return (
    <>
      <Card
        variant="muted"
        mainSx={{
          justifyContent: ["center", "center", "center", "space-between"],
          padding: 1,
          flexDirection: ["column", "column", "column", "row"],
        }}
      >
        <Flex sx={{ marginBottom: [2, 2, 2, 0] }}>
          <UBI size={32} />
          <AccruedUBI
            registered={registered}
            web3={web3}
            accruedPerSecond={accruedPerSecond}
            currentBalanceOf={currentBalanceOf}
            sx={{ marginLeft: 2 }}
          />
        </Flex>
        {lastMintedSecond &&
          lastMintedSecond.gt(web3.utils.toBN(0)) &&
          typeof registered === "boolean" &&
          !registered && (
            <Button
              variant="secondary"
              disabled={lastMintedSecondStatus === "pending"}
              onClick={() =>
                reportRemoval(submissionID).then(reCallAccruedSince)
              }
              loading={reportRemovalLoading}
            >
              Seize UBI
            </Button>
          )}
        {status.key === submissionStatusEnum.Vouching.key &&
          [...queuedVouches.keys()].length > 0 &&
          [...queuedVouches.keys()].length === registeredVouchers.length &&
          `Vouches in use in other submissions: ${
            [...queuedVouches.keys()].length
          }`}
        {(ownValidVouches?.signatures?.length >= requiredNumberOfVouches ||
          availableOnchainVouches?.length >= requiredNumberOfVouches) &&
          status.key === submissionStatusEnum.Vouching.key &&
          firstRoundFullyFunded && (
            <Flex sx={{ alignItems: "center" }}>
              <Text sx={{ marginRight: 2 }}>Wait or</Text>
              <Button
                variant="secondary"
                onClick={advanceToPending}
                loading={changeStateToPendingSendLoading}
              >
                Advance to Pending
              </Button>
            </Flex>
          )}
        {challengeTimeRemaining < 0 &&
          (status.key === submissionStatusEnum.PendingRegistration.key ? (
            <Button
              variant="secondary"
              disabled={fetchingElegible}
              onClick={registerAndAdvanceOthers}
              loading={fetchingElegible}
            >
              Finalize registration and start accruing{" "}
              <Text as="span" role="img" sx={{ marginLeft: 1 }}>
                💧
              </Text>
            </Button>
          ) : (
            status.key === submissionStatusEnum.Registered.key &&
            lastMintedSecond?.eq(web3.utils.toBN(0)) && (
              <Button
                variant="secondary"
                disabled={lastMintedSecondStatus === "pending"}
                onClick={() =>
                  startAccruing(submissionID).then(reCallAccruedSince)
                }
                loading={startAccruingLoading}
              >
                Start Accruing{" "}
                <Text as="span" role="img" sx={{ marginLeft: 1 }}>
                  💧
                </Text>
              </Button>
            )
          ))}
      </Card>
      {status.key === submissionStatusEnum.Vouching.key &&
        [...queuedVouches.keys()].length > 0 &&
        [...queuedVouches.keys()].length === registeredVouchers.length && (
          <Alert type="muted" title="Pending Vouch Release" sx={{ mt: 3 }}>
            <Text>
              All vouches given to this submission are being used by other
              submissions. Either wait for them to resolve or ask that someone
              else with a free vouch to also vouch for you.
            </Text>
          </Alert>
        )}
    </>
  );
}
