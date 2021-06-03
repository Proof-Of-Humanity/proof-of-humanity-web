import { Address, BigInt, ByteArray, crypto } from "@graphprotocol/graph-ts";
import {
  AddSubmissionCall,
  AddSubmissionManuallyCall,
  AddVouchCall,
  ArbitratorComplete,
  ChallengeRequestCall,
  ChangeArbitratorCall,
  ChangeDurationsCall,
  ChangeGovernorCall,
  ChangeLoserStakeMultiplierCall,
  ChangeMetaEvidenceCall,
  ChangeRequiredNumberOfVouchesCall,
  ChangeSharedStakeMultiplierCall,
  ChangeStateToPendingCall,
  ChangeSubmissionBaseDepositCall,
  ChangeWinnerStakeMultiplierCall,
  ExecuteRequestCall,
  FundAppealCall,
  FundSubmissionCall,
  MetaEvidence as MetaEvidenceEvent,
  ProcessVouchesCall,
  ProofOfHumanity,
  ReapplySubmissionCall,
  RemoveSubmissionCall,
  RemoveSubmissionManuallyCall,
  RemoveVouchCall,
  RuleCall,
  SubmitEvidenceCall,
  WithdrawFeesAndRewardsCall,
  WithdrawSubmissionCall,
  VouchAdded as VouchAddedEvent,
} from "../generated/ProofOfHumanity/ProofOfHumanity";
import {
  Challenge,
  Contract,
  Contribution,
  Evidence,
  MetaEvidence,
  Request,
  Round,
  Submission,
  Counter,
} from "../generated/schema";

let zeroAddress = "0x0000000000000000000000000000000000000000";

function getStatus(status: number): string {
  if (status == 0) return "None";
  if (status == 1) return "Vouching";
  if (status == 2) return "PendingRegistration";
  if (status == 3) return "PendingRemoval";
  return "Error";
}

function getReason(reason: number): string {
  if (reason == 0) return "None";
  if (reason == 1) return "IncorrectSubmission";
  if (reason == 2) return "Deceased";
  if (reason == 3) return "Duplicate";
  if (reason == 4) return "DoesNotExist";
  return "Error";
}

function concatByteArrays(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i];
  for (let j = 0; j < b.length; j++) out[a.length + j] = b[j];
  return out as ByteArray;
}

function updateContribution(
  proofOfHumanityAddress: Address,
  submissionID: Address,
  requestIndex: BigInt,
  challengeIndex: BigInt,
  roundIndex: BigInt,
  roundID: ByteArray,
  contributor: Address,
  time: BigInt,
  requestResolved: boolean
): void {
  let proofOfHumanity = ProofOfHumanity.bind(proofOfHumanityAddress);
  let roundInfo = proofOfHumanity.getRoundInfo(
    submissionID,
    requestIndex,
    challengeIndex,
    roundIndex
  );
  let contributions = proofOfHumanity.getContributions(
    submissionID,
    requestIndex,
    challengeIndex,
    roundIndex,
    contributor
  );

  let round = Round.load(roundID.toHexString());
  round.paidFees = roundInfo.value1;
  round.hasPaid = [
    roundInfo.value0 ? roundInfo.value2 == 0 : roundInfo.value2 == 1,
    roundInfo.value0 ? roundInfo.value2 == 0 : roundInfo.value2 == 2,
  ];
  round.feeRewards = roundInfo.value3;
  round.save();

  let contributionID = crypto
    .keccak256(concatByteArrays(roundID, contributor))
    .toHexString();
  let contribution = Contribution.load(contributionID);
  if (contribution == null) {
    contribution = new Contribution(contributionID);
    contribution.creationTime = time;
    contribution.requestIndex = requestIndex;
    contribution.roundIndex = roundIndex;
    contribution.round = round.id;
    contribution.contributor = contributor;
  }
  contribution.values = [contributions[1], contributions[2]];
  contribution.requestResolved = requestResolved;
  contribution.save();
}

function requestStatusChange(
  submissionID: Address,
  timestamp: BigInt,
  msgSender: Address,
  evidenceURI: string,
  proofOfHumanityAddress: Address,
  time: BigInt
): void {
  let contract = Contract.load("0");
  let submission = Submission.load(submissionID.toHexString());

  let requestID = crypto.keccak256(
    concatByteArrays(
      submissionID,
      ByteArray.fromUTF8(submission.requestsLength.toString())
    )
  );
  submission.requestsLength = submission.requestsLength.plus(BigInt.fromI32(1));
  submission.save();

  let request = new Request(requestID.toHexString());
  request.creationTime = time;
  request.submission = submission.id;
  request.disputed = false;
  request.lastStatusChange = timestamp;
  request.resolved = false;
  request.requester = msgSender;
  request.arbitrator = contract.arbitrator;
  request.arbitratorExtraData = contract.arbitratorExtraData;
  request.vouches = [];
  request.usedReasons = [];
  request.currentReason = "None";
  request.nbParallelDisputes = BigInt.fromI32(0);
  request.requesterLost = false;
  request.penaltyIndex = BigInt.fromI32(0);
  request.metaEvidence =
    submission.status == "PendingRemoval"
      ? contract.clearingMetaEvidence
      : contract.registrationMetaEvidence;
  request.type =
    submission.status == "PendingRemoval" ? "Removal" : "Registration";
  request.resolutionTime = BigInt.fromI32(0);
  request.registration = submission.status == "Vouching";
  request.evidenceLength = BigInt.fromI32(1);
  request.challengesLength = BigInt.fromI32(1);
  request.save();

  let evidence = new Evidence(
    crypto
      .keccak256(concatByteArrays(requestID, ByteArray.fromUTF8("Evidence-0")))
      .toHexString()
  );
  evidence.creationTime = time;
  evidence.request = request.id;
  evidence.URI = evidenceURI;
  evidence.sender = msgSender;
  evidence.save();

  let challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  let challenge = new Challenge(challengeID.toHexString());
  challenge.creationTime = time;
  challenge.request = request.id;
  challenge.requester = request.requester;
  challenge.challengeID = BigInt.fromI32(0);
  challenge.roundsLength = BigInt.fromI32(1);
  challenge.save();

  let roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8("0"))
  );
  let round = new Round(roundID.toHexString());
  round.creationTime = time;
  round.challenge = challenge.id;
  round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
  round.hasPaid = [false, false];
  round.feeRewards = BigInt.fromI32(0);
  round.save();

  updateContribution(
    proofOfHumanityAddress,
    submissionID,
    submission.requestsLength.minus(BigInt.fromI32(1)),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    roundID,
    msgSender,
    time,
    request.resolved
  );
}

function processVouchesHelper(
  submissionID: Address,
  requestID: BigInt,
  iterations: BigInt
): void {
  let request = Request.load(
    crypto
      .keccak256(
        concatByteArrays(submissionID, ByteArray.fromUTF8(requestID.toString()))
      )
      .toHexString()
  );
  let requestVouchesLength = BigInt.fromI32(request.vouches.length);
  let actualIterations = iterations
    .plus(request.penaltyIndex)
    .gt(requestVouchesLength)
    ? requestVouchesLength.minus(request.penaltyIndex)
    : iterations;
  let endIndex = actualIterations.plus(request.penaltyIndex);
  request.penaltyIndex = endIndex;
  request.save();

  for (let i = 0; i < endIndex.toI32(); i++) {
    let vouches = request.vouches;
    let requestUsedReasons = request.usedReasons;

    let voucher = Submission.load(vouches[i]);
    voucher.usedVouch = null;

    if (request.ultimateChallenger != null) {
      if (
        requestUsedReasons[requestUsedReasons.length - 1] == "Duplicate" ||
        requestUsedReasons[requestUsedReasons.length - 1] == "DoesNotExist"
      ) {
        if (
          voucher.status == "Vouching" ||
          voucher.status == "PendingRegistration"
        ) {
          let voucherRequest = Request.load(
            crypto
              .keccak256(
                concatByteArrays(
                  ByteArray.fromHexString(voucher.id),
                  ByteArray.fromUTF8(
                    voucher.requestsLength.minus(BigInt.fromI32(1)).toString()
                  )
                )
              )
              .toHexString()
          );
          voucherRequest.requesterLost = true;
          voucherRequest.save();
        }

        voucher.registered = false;
      }
    }

    voucher.save();
  }
}

export function vouchAddedByChangeStateToPending(event: VouchAddedEvent): void {
  // This handler is exclusively for events VouchAdded events emited
  // by calling changeStateToPending.
  let functionSig = event.transaction.input.toHexString().slice(0, 10);
  if (functionSig === "0x32fe596f") return; // Ignore if emitted by addVouch.

  let submission = Submission.load(event.params._voucher.toHexString());
  if (submission != null) {
    submission.vouchees = submission.vouchees.concat([
      event.params._submissionID.toHexString(),
    ]);
    submission.save();

    let vouchedSubmission = Submission.load(
      event.params._submissionID.toHexString()
    );
    if (vouchedSubmission != null) {
      vouchedSubmission.vouchesReceived =
        vouchedSubmission.vouchesReceived.concat([
          event.params._voucher.toHexString(),
        ]);
      vouchedSubmission.vouchesReceivedLength =
        vouchedSubmission.vouchesReceivedLength.plus(BigInt.fromI32(1));
      vouchedSubmission.save();
    }
  }
}

export function metaEvidence(event: MetaEvidenceEvent): void {
  let metaEvidence = new MetaEvidence(
    event.params._metaEvidenceID.toHexString()
  );
  metaEvidence.URI = event.params._evidence;
  metaEvidence.save();

  let contract = Contract.load("0");
  if (contract == null) return;
  contract.metaEvidenceUpdates = contract.metaEvidenceUpdates.plus(
    BigInt.fromI32(1)
  );
  if (
    event.params._metaEvidenceID
      .mod(BigInt.fromI32(2))
      .equals(BigInt.fromI32(0))
  )
    contract.registrationMetaEvidence = metaEvidence.id;
  else contract.clearingMetaEvidence = metaEvidence.id;
  contract.save();
}

export function arbitratorComplete(event: ArbitratorComplete): void {
  let proofOfHumanity = ProofOfHumanity.bind(event.address);
  let contract = new Contract("0");
  contract.arbitrator = event.params._arbitrator;
  let arbitratorDataList = proofOfHumanity.arbitratorDataList(
    BigInt.fromI32(0)
  );
  contract.arbitratorExtraData = arbitratorDataList.value2;
  contract.governor = event.params._governor;
  contract.submissionBaseDeposit = event.params._submissionBaseDeposit;
  contract.submissionChallengeBaseDeposit = BigInt.fromI32(0);
  contract.submissionDuration = event.params._submissionDuration;
  contract.renewalTime = proofOfHumanity.renewalPeriodDuration();
  contract.challengePeriodDuration = event.params._challengePeriodDuration;
  contract.requiredNumberOfVouches = event.params._requiredNumberOfVouches;
  contract.metaEvidenceUpdates = BigInt.fromI32(0);
  contract.sharedStakeMultiplier = event.params._sharedStakeMultiplier;
  contract.winnerStakeMultiplier = event.params._winnerStakeMultiplier;
  contract.loserStakeMultiplier = event.params._loserStakeMultiplier;
  contract.registrationMetaEvidence = "0x0";
  contract.clearingMetaEvidence = "0x1";
  contract.save();

  let counter = new Counter("0");
  counter.vouchingPhase = BigInt.fromI32(0);
  counter.pendingRegistration = BigInt.fromI32(0);
  counter.pendingRemoval = BigInt.fromI32(0);
  counter.challengedRegistration = BigInt.fromI32(0);
  counter.challengedRemoval = BigInt.fromI32(0);
  counter.registered = BigInt.fromI32(0);
  counter.expired = BigInt.fromI32(0);
  counter.removed = BigInt.fromI32(0);
  counter.save();
}

export function addSubmissionManually(call: AddSubmissionManuallyCall): void {
  let submissionIDs = call.inputs._submissionIDs;
  let evidences = call.inputs._evidence;
  let names = call.inputs._names;
  for (let i = 0; i < submissionIDs.length; i++) {
    let contract = Contract.load("0");
    let submission = new Submission(submissionIDs[i].toHexString());
    submission.creationTime = call.block.timestamp;
    submission.status = "None";
    submission.registered = true;
    submission.submissionTime = call.block.timestamp;
    submission.name = names[i];
    submission.vouchees = [];
    submission.vouchesReceived = [];
    submission.vouchesReceivedLength = BigInt.fromI32(0);
    submission.disputed = false;
    submission.requestsLength = BigInt.fromI32(1);
    submission.save();
    increaseCurrentStatusCounter(submission);

    let requestID = crypto.keccak256(
      concatByteArrays(submissionIDs[i], ByteArray.fromUTF8("0"))
    );
    let request = new Request(requestID.toHexString());
    request.creationTime = call.block.timestamp;
    request.submission = submission.id;
    request.disputed = false;
    request.lastStatusChange = call.block.timestamp;
    request.resolved = true;
    request.requester = call.from;
    request.arbitrator = contract.arbitrator;
    request.arbitratorExtraData = contract.arbitratorExtraData;
    request.vouches = [];
    request.usedReasons = [];
    request.currentReason = "None";
    request.nbParallelDisputes = BigInt.fromI32(0);
    request.requesterLost = false;
    request.penaltyIndex = BigInt.fromI32(0);
    request.metaEvidence = contract.registrationMetaEvidence;
    request.registration = true;
    request.evidenceLength = BigInt.fromI32(1);
    request.challengesLength = BigInt.fromI32(1);
    request.type = "Registration";
    request.resolutionTime = call.block.timestamp;
    request.save();

    let evidence = new Evidence(
      crypto
        .keccak256(
          concatByteArrays(requestID, ByteArray.fromUTF8("Evidence-0"))
        )
        .toHexString()
    );
    evidence.creationTime = call.block.timestamp;
    evidence.request = request.id;
    evidence.URI = evidences[i];
    evidence.sender = call.from;
    evidence.save();

    let challengeID = crypto.keccak256(
      concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
    );
    let challenge = new Challenge(challengeID.toHexString());
    challenge.challengeID = BigInt.fromI32(0);
    challenge.creationTime = call.block.timestamp;
    challenge.request = request.id;
    challenge.requester = request.requester;
    challenge.roundsLength = BigInt.fromI32(1);
    challenge.save();

    let round = new Round(
      crypto
        .keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("0")))
        .toHexString()
    );
    round.creationTime = call.block.timestamp;
    round.challenge = challenge.id;
    round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    round.hasPaid = [false, false];
    round.feeRewards = BigInt.fromI32(0);
    round.save();
  }
}

export function removeSubmissionManually(
  call: RemoveSubmissionManuallyCall
): void {
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.registered = false;
  submission.save();
  increaseCurrentStatusCounter(submission);
}

export function changeSubmissionBaseDeposit(
  call: ChangeSubmissionBaseDepositCall
): void {
  let contract = Contract.load("0");
  contract.submissionBaseDeposit = call.inputs._submissionBaseDeposit;
  contract.save();
}

export function changeDurations(call: ChangeDurationsCall): void {
  let contract = Contract.load("0");
  contract.submissionDuration = call.inputs._submissionDuration;
  contract.renewalTime = call.inputs._renewalPeriodDuration;
  contract.challengePeriodDuration = call.inputs._challengePeriodDuration;
  contract.save();
}

export function changeRequiredNumberOfVouches(
  call: ChangeRequiredNumberOfVouchesCall
): void {
  let contract = Contract.load("0");
  contract.requiredNumberOfVouches = call.inputs._requiredNumberOfVouches;
  contract.save();
}

export function changeSharedStakeMultiplier(
  call: ChangeSharedStakeMultiplierCall
): void {
  let contract = Contract.load("0");
  contract.sharedStakeMultiplier = call.inputs._sharedStakeMultiplier;
  contract.save();
}

export function changeWinnerStakeMultiplier(
  call: ChangeWinnerStakeMultiplierCall
): void {
  let contract = Contract.load("0");
  contract.winnerStakeMultiplier = call.inputs._winnerStakeMultiplier;
  contract.save();
}

export function changeLoserStakeMultiplier(
  call: ChangeLoserStakeMultiplierCall
): void {
  let contract = Contract.load("0");
  contract.loserStakeMultiplier = call.inputs._loserStakeMultiplier;
  contract.save();
}

export function changeGovernor(call: ChangeGovernorCall): void {
  let contract = Contract.load("0");
  contract.governor = call.inputs._governor;
  contract.save();
}

export function changeMetaEvidence(call: ChangeMetaEvidenceCall): void {
  let contract = Contract.load("0");
  contract.metaEvidenceUpdates = contract.metaEvidenceUpdates.plus(
    BigInt.fromI32(1)
  );

  let registrationMetaEvidenceID = contract.metaEvidenceUpdates.times(
    BigInt.fromI32(2)
  );
  let registrationMetaEvidence = new MetaEvidence(
    registrationMetaEvidenceID.toHexString()
  );
  registrationMetaEvidence.URI = call.inputs._registrationMetaEvidence;
  registrationMetaEvidence.save();

  let clearingMetaEvidence = new MetaEvidence(
    registrationMetaEvidenceID.plus(BigInt.fromI32(1)).toHexString()
  );
  clearingMetaEvidence.URI = call.inputs._clearingMetaEvidence;
  clearingMetaEvidence.save();

  contract.registrationMetaEvidence = registrationMetaEvidence.id;
  contract.clearingMetaEvidence = clearingMetaEvidence.id;
  contract.save();
}

export function changeArbitrator(call: ChangeArbitratorCall): void {
  let contract = Contract.load("0");
  contract.arbitrator = call.inputs._arbitrator;
  contract.arbitratorExtraData = call.inputs._arbitratorExtraData;
  contract.save();
}

export function addSubmission(call: AddSubmissionCall): void {
  let submissionID = call.from.toHexString();
  let submission = Submission.load(submissionID);
  if (submission == null) {
    submission = new Submission(submissionID);
    submission.creationTime = call.block.timestamp;
    submission.registered = false;
    submission.name = call.inputs._name;
    submission.vouchees = [];
    submission.vouchesReceived = [];
    submission.disputed = false;
    submission.requestsLength = BigInt.fromI32(0);
    submission.vouchesReceivedLength = BigInt.fromI32(0);
  } else {
    decreasePreviousStatusCounter(submission);
  }
  submission.status = "Vouching";
  submission.save();
  increaseCurrentStatusCounter(submission);

  requestStatusChange(
    call.from,
    call.block.timestamp,
    call.from,
    call.inputs._evidence,
    call.to,
    call.block.timestamp
  );
}

export function reapplySubmission(call: ReapplySubmissionCall): void {
  let submission = Submission.load(call.from.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.status = "Vouching";
  submission.save();
  increaseCurrentStatusCounter(submission);

  requestStatusChange(
    call.from,
    call.block.timestamp,
    call.from,
    call.inputs._evidence,
    call.to,
    call.block.timestamp
  );
}

export function removeSubmission(call: RemoveSubmissionCall): void {
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.status = "PendingRemoval";
  submission.save();
  increaseCurrentStatusCounter(submission);

  requestStatusChange(
    call.inputs._submissionID,
    call.block.timestamp,
    call.from,
    call.inputs._evidence,
    call.to,
    call.block.timestamp
  );
}

export function fundSubmission(call: FundSubmissionCall): void {
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  let requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  let requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  let request = Request.load(requestID.toHexString());
  let challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  let roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8("0"))
  );
  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    roundID,
    call.from,
    call.block.timestamp,
    request.resolved
  );
}

export function addVouch(call: AddVouchCall): void {
  let submission = Submission.load(call.from.toHexString());
  if (submission != null) {
    submission.vouchees = submission.vouchees.concat([
      call.inputs._submissionID.toHexString(),
    ]);
    submission.save();

    let vouchedSubmission = Submission.load(
      call.inputs._submissionID.toHexString()
    );
    if (vouchedSubmission != null) {
      vouchedSubmission.vouchesReceived =
        vouchedSubmission.vouchesReceived.concat([call.from.toHexString()]);
      vouchedSubmission.vouchesReceivedLength =
        vouchedSubmission.vouchesReceivedLength.plus(BigInt.fromI32(1));
      vouchedSubmission.save();
    }
  }
}

export function removeVouch(call: RemoveVouchCall): void {
  let submission = Submission.load(call.from.toHexString());
  if (submission != null) {
    let vouchees = submission.vouchees;
    let nextVouchees = new Array<string>();
    for (let i = 0; i < vouchees.length; i++)
      if (vouchees[i] != call.inputs._submissionID.toHexString())
        nextVouchees.push(vouchees[i]);
    submission.vouchees = nextVouchees;
    submission.save();

    let vouchedSubmission = Submission.load(
      call.inputs._submissionID.toHexString()
    );
    if (vouchedSubmission != null) {
      let vouchers = vouchedSubmission.vouchesReceived;
      let updatedVouchers = new Array<string>();
      for (let i = 0; i < vouchers.length; i++)
        if (vouchers[i] != call.from.toHexString())
          updatedVouchers.push(vouchers[i]);
      vouchedSubmission.vouchesReceived = updatedVouchers;
      vouchedSubmission.save();
    }
  }
}

export function withdrawSubmission(call: WithdrawSubmissionCall): void {
  let submission = Submission.load(call.from.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.status = "None";
  submission.save();
  increaseCurrentStatusCounter(submission);

  let requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  let requestID = crypto.keccak256(
    concatByteArrays(call.from, ByteArray.fromUTF8(requestIndex.toString()))
  );
  let request = Request.load(requestID.toHexString());
  request.resolved = true;
  request.resolutionTime = call.block.timestamp;
  request.save();

  let challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  let roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8("0"))
  );

  updateContribution(
    call.to,
    call.from,
    requestIndex,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    roundID,
    call.from,
    call.block.timestamp,
    request.resolved
  );
}

export function changeStateToPending(call: ChangeStateToPendingCall): void {
  let contract = Contract.load("0");
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.status = "PendingRegistration";
  submission.save();
  increaseCurrentStatusCounter(submission);

  let request = Request.load(
    crypto
      .keccak256(
        concatByteArrays(
          call.inputs._submissionID,
          ByteArray.fromUTF8(
            submission.requestsLength.minus(BigInt.fromI32(1)).toString()
          )
        )
      )
      .toHexString()
  );
  request.lastStatusChange = call.block.timestamp;

  let vouches = call.inputs._vouches;
  for (let i = 0; i < vouches.length; i++) {
    let voucher = Submission.load(vouches[i].toHexString());
    if (
      !voucher.usedVouch &&
      voucher.registered &&
      call.block.timestamp
        .minus(voucher.submissionTime as BigInt)
        .le(contract.submissionDuration) &&
      voucher.vouchees.includes(submission.id)
    ) {
      request.vouches = request.vouches.concat([voucher.id]);
      voucher.usedVouch = submission.id;
      voucher.save();
    }
  }
  request.save();
}

export function challengeRequest(call: ChallengeRequestCall): void {
  let callInputsReason = getReason(call.inputs._reason);
  let proofOfHumanity = ProofOfHumanity.bind(call.to);
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.disputed = true;
  submission.save();
  increaseCurrentStatusCounter(submission);

  let requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  let requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  let request = Request.load(requestID.toHexString());
  request.disputed = true;
  request.usedReasons = request.usedReasons.concat([callInputsReason]);
  request.currentReason = callInputsReason;
  request.nbParallelDisputes = request.nbParallelDisputes.plus(
    BigInt.fromI32(1)
  );

  if (call.inputs._evidence != zeroAddress) {
    let evidenceIndex = request.evidenceLength;
    request.evidenceLength = evidenceIndex.plus(BigInt.fromI32(1));
    let evidence = new Evidence(
      crypto
        .keccak256(
          concatByteArrays(
            requestID,
            ByteArray.fromUTF8("Evidence-" + evidenceIndex.toString())
          )
        )
        .toHexString()
    );
    evidence.creationTime = call.block.timestamp;
    evidence.request = request.id;
    evidence.URI = call.inputs._evidence;
    evidence.sender = call.from;
    evidence.save();
  }

  let challengeIndex = request.challengesLength.minus(BigInt.fromI32(1));
  let challengeID = crypto.keccak256(
    concatByteArrays(
      requestID,
      ByteArray.fromUTF8("Challenge-" + challengeIndex.toString())
    )
  );
  let challenge = Challenge.load(challengeID.toHexString());
  if (challenge.disputeID) {
    challengeIndex = request.challengesLength;
    request.challengesLength = request.challengesLength.plus(BigInt.fromI32(1));
    challengeID = concatByteArrays(
      requestID,
      ByteArray.fromUTF8("Challenge-" + challengeIndex.toString())
    );
    challenge = new Challenge(challengeID.toHexString());
    challenge.creationTime = call.block.timestamp;
    challenge.request = request.id;
    challenge.requester = request.requester;

    let requestInfo = proofOfHumanity.getRequestInfo(
      call.inputs._submissionID,
      requestIndex
    );
    challenge.challengeID = BigInt.fromI32(requestInfo.value6);
  }
  request.save();

  let challengeInfo = proofOfHumanity.getChallengeInfo(
    call.inputs._submissionID,
    requestIndex,
    challengeIndex
  );
  challenge.reason = callInputsReason;
  challenge.disputeID = challengeInfo.value2;
  challenge.challenger = call.from;
  if (callInputsReason == "Duplicate") {
    challenge.duplicateSubmission = call.inputs._duplicateID.toHexString();
  }
  challenge.roundsLength = BigInt.fromI32(2);
  challenge.save();

  let round = new Round(
    crypto
      .keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("1")))
      .toHexString()
  );
  round.creationTime = call.block.timestamp;
  round.challenge = challenge.id;
  round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
  round.hasPaid = [false, false];
  round.feeRewards = BigInt.fromI32(0);
  round.save();

  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    challengeIndex,
    BigInt.fromI32(0),
    crypto.keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("0"))),
    call.from,
    call.block.timestamp,
    request.resolved
  );
}

export function fundAppeal(call: FundAppealCall): void {
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  let requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  let requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  let request = Request.load(requestID.toHexString());

  let challengeID = crypto.keccak256(
    concatByteArrays(
      requestID,
      ByteArray.fromUTF8("Challenge-" + call.inputs._challengeID.toString())
    )
  );
  let challenge = Challenge.load(challengeID.toHexString());
  let roundIndex = challenge.roundsLength.minus(BigInt.fromI32(1));
  let roundID = crypto.keccak256(
    concatByteArrays(challengeID, ByteArray.fromUTF8(roundIndex.toString()))
  );

  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    call.inputs._challengeID,
    roundIndex,
    roundID,
    call.from,
    call.block.timestamp,
    request.resolved
  );

  let round = Round.load(roundID.toHexString());
  if (!round.hasPaid.includes(false)) {
    roundIndex = challenge.roundsLength;
    challenge.roundsLength = roundIndex.plus(BigInt.fromI32(1));
    challenge.save();
    round = new Round(
      crypto
        .keccak256(
          concatByteArrays(
            challengeID,
            ByteArray.fromUTF8(roundIndex.toString())
          )
        )
        .toHexString()
    );
    round.creationTime = call.block.timestamp;
    round.challenge = challenge.id;
    round.paidFees = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    round.hasPaid = [false, false];
    round.feeRewards = BigInt.fromI32(0);
    round.save();
  }
}

export function executeRequest(call: ExecuteRequestCall): void {
  let proofOfHumanity = ProofOfHumanity.bind(call.to);
  let submissionInfo = proofOfHumanity.getSubmissionInfo(
    call.inputs._submissionID
  );

  // Patch. If the status of the submission is not 0 (None), the call must have reverted.
  if (getStatus(submissionInfo.value0) != "None") return;

  let submission = Submission.load(call.inputs._submissionID.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.status = "None";
  submission.registered = submissionInfo.value3;
  submission.submissionTime = submissionInfo.value1;
  submission.save();
  increaseCurrentStatusCounter(submission);

  let requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  let requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  let request = Request.load(requestID.toHexString());
  request.resolved = true;
  request.resolutionTime = call.block.timestamp;
  request.save();

  let challengeID = crypto.keccak256(
    concatByteArrays(requestID, ByteArray.fromUTF8("Challenge-0"))
  );
  processVouchesHelper(
    call.inputs._submissionID,
    requestIndex,
    BigInt.fromI32(10) // AUTO_PROCESSED_VOUCH
  );
  updateContribution(
    call.to,
    call.inputs._submissionID,
    requestIndex,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    crypto.keccak256(concatByteArrays(challengeID, ByteArray.fromUTF8("0"))),
    request.requester as Address,
    call.block.timestamp,
    request.resolved
  );
}

export function processVouches(call: ProcessVouchesCall): void {
  processVouchesHelper(
    call.inputs._submissionID,
    call.inputs._requestID,
    call.inputs._iterations
  );
}

export function withdrawFeesAndRewards(call: WithdrawFeesAndRewardsCall): void {
  let requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(call.inputs._requestID.toString())
    )
  );
  let request = Request.load(requestID.toHexString());
  let challengeID = crypto.keccak256(
    concatByteArrays(
      requestID,
      ByteArray.fromUTF8("Challenge-" + call.inputs._challengeID.toString())
    )
  );
  updateContribution(
    call.to,
    call.inputs._submissionID,
    call.inputs._requestID,
    call.inputs._challengeID,
    call.inputs._round,
    crypto.keccak256(
      concatByteArrays(
        challengeID,
        ByteArray.fromUTF8(call.inputs._round.toString())
      )
    ),
    call.inputs._beneficiary,
    call.block.timestamp,
    request.resolved
  );
}

export function rule(call: RuleCall): void {
  let proofOfHumanity = ProofOfHumanity.bind(call.to);
  let disputeData = proofOfHumanity.arbitratorDisputeIDToDisputeData(
    call.from,
    call.inputs._disputeID
  );
  let submissionInfo = proofOfHumanity.getSubmissionInfo(disputeData.value1);

  let submission = Submission.load(disputeData.value1.toHexString());
  decreasePreviousStatusCounter(submission);
  submission.status = getStatus(submissionInfo.value0);
  submission.registered = submissionInfo.value3;
  submission.submissionTime = submissionInfo.value1;

  let requestIndex = submission.requestsLength.minus(BigInt.fromI32(1));
  let requestInfo = proofOfHumanity.getRequestInfo(
    disputeData.value1,
    requestIndex
  );
  submission.disputed = false;
  submission.save();
  increaseCurrentStatusCounter(submission);
  let requestID = crypto.keccak256(
    concatByteArrays(
      disputeData.value1,
      ByteArray.fromUTF8(requestIndex.toString())
    )
  );
  let request = Request.load(requestID.toHexString());
  request.disputed = requestInfo.value0;
  request.lastStatusChange = call.block.timestamp;
  request.resolved = requestInfo.value1;
  request.currentReason = getReason(requestInfo.value3);
  request.nbParallelDisputes = BigInt.fromI32(requestInfo.value4);
  request.ultimateChallenger = requestInfo.value8;
  request.requesterLost = requestInfo.value2;
  request.save();

  let challenge = Challenge.load(
    crypto
      .keccak256(
        concatByteArrays(
          requestID,
          ByteArray.fromUTF8("Challenge-" + disputeData.value0.toString())
        )
      )
      .toHexString()
  );
  challenge.ruling = BigInt.fromI32(
    proofOfHumanity.getChallengeInfo(
      disputeData.value1,
      requestIndex,
      disputeData.value0
    ).value3
  );
  challenge.save();
}

export function submitEvidence(call: SubmitEvidenceCall): void {
  let submission = Submission.load(call.inputs._submissionID.toHexString());
  let requestID = crypto.keccak256(
    concatByteArrays(
      call.inputs._submissionID,
      ByteArray.fromUTF8(
        submission.requestsLength.minus(BigInt.fromI32(1)).toString()
      )
    )
  );
  let request = Request.load(requestID.toHexString());
  let evidenceIndex = request.evidenceLength;
  request.evidenceLength = evidenceIndex.plus(BigInt.fromI32(1));
  request.save();

  let evidence = new Evidence(
    crypto
      .keccak256(
        concatByteArrays(
          requestID,
          ByteArray.fromUTF8("Evidence-" + evidenceIndex.toString())
        )
      )
      .toHexString()
  );
  evidence.creationTime = call.block.timestamp;
  evidence.request = request.id;
  evidence.URI = call.inputs._evidence;
  evidence.sender = call.from;
  evidence.save();
}

function decreasePreviousStatusCounter(submission: Submission | null): void {
  let counter = Counter.load("0");
  let one = BigInt.fromI32(1);
  if (submission.status == "Vouching")
    counter.vouchingPhase = counter.vouchingPhase.minus(one);
  else if (submission.status == "PendingRegistration") {
    if (submission.disputed)
      counter.challengedRegistration =
        counter.challengedRegistration.minus(one);
    else counter.pendingRegistration = counter.pendingRegistration.minus(one);
  } else if (submission.status == "PendingRemoval") {
    if (submission.disputed)
      counter.challengedRemoval = counter.challengedRemoval.minus(one);
    else counter.pendingRemoval = counter.pendingRemoval.minus(one);
  } else if (submission.status == "None") {
    if (!submission.registered) counter.removed = counter.removed.minus(one);
  } else return;
  counter.save();
}

function increaseCurrentStatusCounter(submission: Submission | null): void {
  let counter = Counter.load("0");
  let one = BigInt.fromI32(1);
  if (submission.status == "Vouching")
    counter.vouchingPhase = counter.vouchingPhase.plus(one);
  else if (submission.status == "PendingRegistration") {
    if (submission.disputed)
      counter.challengedRegistration = counter.challengedRegistration.plus(one);
    else counter.pendingRegistration = counter.pendingRegistration.plus(one);
  } else if (submission.status == "PendingRemoval") {
    if (submission.disputed)
      counter.challengedRemoval = counter.challengedRemoval.plus(one);
    else counter.pendingRemoval = counter.pendingRemoval.plus(one);
  } else if (submission.status == "None") {
    if (!submission.registered) counter.removed = counter.removed.plus(one);
  } else return;
  counter.save();
}
