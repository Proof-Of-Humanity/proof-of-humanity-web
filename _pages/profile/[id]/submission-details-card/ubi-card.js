/* eslint-disable capitalized-comments */
/* eslint-disable jsx-a11y/accessible-emoji */
import {
  Button,
  Card,
  Flex,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { UBI } from "@kleros/icons";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import { submissionStatusEnum } from "data";
import ProofOfHumanityAbi from "subgraph/abis/proof-of-humanity";
import UBIAbi from "subgraph/abis/ubi";
import { UBIAddress, address as pohAddress } from "subgraph/config";

function AccruedUBI({ lastMintedSecond, web3, accruedPerSecond, ...rest }) {
  const [, rerender] = useReducer(() => ({}), {});
  useEffect(() => {
    const timeout = setInterval(() => rerender(), 1000);
    return () => clearInterval(timeout);
  }, []);

  let accruedUBI;
  if (lastMintedSecond)
    if (lastMintedSecond.eq(web3.utils.toBN(0))) accruedUBI = lastMintedSecond;
    else if (accruedPerSecond)
      accruedUBI = web3.utils
        .toBN(Math.floor(Date.now() / 1000))
        .sub(lastMintedSecond)
        .mul(accruedPerSecond);

  return (
    <Text {...rest}>
      {accruedUBI && `${web3.utils.fromWei(accruedUBI)} UBI`}
    </Text>
  );
}
export default function UBICard({
  submissionID,
  lastStatusChange,
  challengePeriodDuration,
  status,
}) {
  const { web3 } = useWeb3();

  const [lastMintedSecond, , lastMintedSecondStatus, reCall] = useContract(
    "UBI",
    "accruedSince",
    useMemo(() => ({ args: [submissionID] }), [submissionID])
  );
  const [registered] = useContract(
    "proofOfHumanity",
    "isRegistered",
    useMemo(() => ({ args: [submissionID] }), [submissionID])
  );

  const [requiredNumberOfVouches] = useContract(
    "proofOfHumanity",
    "requiredNumberOfVouches"
  );
  const [accruedPerSecond] = useContract("UBI", "accruedPerSecond");

  const { send: batchSend, loading: batchSendLoading } = useContract(
    "transactionBatcher",
    "batchSend"
  );
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

  const registerAndAdvance = useCallback(async () => {
    if (!pohInstance || !submissionID || !requiredNumberOfVouches) return;

    const { vouches: users } = await (
      await fetch(
        `${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/all?minVouches=${Number(
          requiredNumberOfVouches
        )}`
      )
    ).json();

    const toVouchCalls = [];
    for (const user of users) {
      if (toVouchCalls.length >= 2) break;

      // eslint-disable-next-line prefer-const
      let [voucheeIsRegistered, ...voucherDatas] = await Promise.all([
        pohInstance.methods.isRegistered(user.submissionId).call(),
        ...user.vouchers.map((voucher) =>
          pohInstance.methods.getSubmissionInfo(voucher).call()
        ),
      ]);

      voucherDatas = voucherDatas.filter(
        (voucherData) => !voucherData.hasVouched && voucherData.registered
      );

      if (voucheeIsRegistered || voucherDatas.length < requiredNumberOfVouches)
        continue;

      toVouchCalls.push(
        pohInstance.methods
          .changeStateToPending(
            user.submissionId,
            [],
            user.signatures,
            user.expirationTimestamps
          )
          .encodeABI()
      );
    }

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
      { gasLimit: 280000 }
    ).then(reCall);
  }, [
    batchSend,
    pohInstance,
    reCall,
    requiredNumberOfVouches,
    submissionID,
    ubiInstance.methods,
    web3.utils,
  ]);

  return (
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
          lastMintedSecond={lastMintedSecond}
          web3={web3}
          accruedPerSecond={accruedPerSecond}
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
            onClick={() => reportRemoval(submissionID).then(reCall)}
            loading={reportRemovalLoading}
          >
            Seize UBI
          </Button>
        )}
      {challengeTimeRemaining < 0 &&
        (status.key === submissionStatusEnum.PendingRegistration.key ? (
          <Button
            variant="secondary"
            Disabled={lastMintedSecondStatus === "pending"}
            onClick={registerAndAdvance}
            Loading={batchSendLoading}
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
              onClick={() => startAccruing(submissionID).then(reCall)}
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
  );
}
