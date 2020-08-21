import { ByteArray, BigInt, crypto } from "@graphprotocol/graph-ts";
import {
  ProofOfHumanity as _ProofOfHumanity,
  MetaEvidence as MetaEvidenceEvent,
  ArbitratorComplete,
  AddSubmissionManuallyCall,
} from "../generated/ProofOfHumanity/ProofOfHumanity";
import {
  MetaEvidence,
  Contract,
  Submission,
  Request,
  Evidence,
} from "../generated/schema";

function concatByteArrays(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i];
  for (let j = 0; j < b.length; j++) out[a.length + j] = b[j];
  return out as ByteArray;
}

export function metaEvidence(event: MetaEvidenceEvent): void {
  let metaEvidence = new MetaEvidence(event.params._metaEvidenceID.toString());
  metaEvidence.URI = event.params._evidence;
  metaEvidence.save();

  let contract = Contract.load("0");
  if (contract == null) return;
  contract.metaEvidenceUpdates = contract.metaEvidenceUpdates.plus(
    new BigInt(1)
  );
  if (event.params._metaEvidenceID.mod(new BigInt(2)).equals(new BigInt(0)))
    contract.registrationMetaEvidence = metaEvidence.id;
  else contract.clearingMetaEvidence = metaEvidence.id;
  contract.save();
}

export function arbitratorComplete(event: ArbitratorComplete): void {
  let ProofOfHumanity = _ProofOfHumanity.bind(event.address);
  let contract = new Contract("0");
  contract.arbitrator = event.params.arbitrator;
  contract.arbitratorExtraData = ProofOfHumanity.arbitratorExtraData();
  contract.governor = event.params.governor;
  contract.submissionBaseDeposit = event.params.submissionBaseDeposit;
  contract.submissionChallengeBaseDeposit =
    event.params.submissionChallengeBaseDeposit;
  contract.submissionDuration = event.params.submissionDuration;
  contract.renewalTime = ProofOfHumanity.renewalTime();
  contract.challengePeriodDuration = event.params.challengePeriodDuration;
  contract.requiredNumberOfVouches = event.params.requiredNumberOfVouches;
  contract.metaEvidenceUpdates = new BigInt(0);
  contract.sharedStakeMultiplier = event.params.sharedStakeMultiplier;
  contract.winnerStakeMultiplier = event.params.winnerStakeMultiplier;
  contract.loserStakeMultiplier = event.params.loserStakeMultiplier;
  contract.registrationMetaEvidence = "0x0";
  contract.clearingMetaEvidence = "0x1";
  contract.save();
}

export function addSubmissionManually(call: AddSubmissionManuallyCall): void {
  let contract = Contract.load("0");
  let submission = new Submission(call.inputs._submissionID.toHexString());
  submission.status = "None";
  submission.registered = true;
  submission.submissionTime = call.block.timestamp;
  submission.renewalTimestamp = call.block.timestamp.plus(
    contract.submissionDuration.minus(contract.renewalTime)
  );
  submission.vouchees = [];
  submission.usedVouch = false;
  submission.save();

  let requestID = crypto.keccak256(
    concatByteArrays(call.inputs._submissionID, ByteArray.fromUTF8("0"))
  );
  let request = new Request(requestID.toHexString());
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
  request.nbParallelDisputes = new BigInt(0);
  request.requesterLost = false;
  request.penaltyIndex = new BigInt(0);
  request.metaEvidence = contract.registrationMetaEvidence;
  request.save();

  let evidence = new Evidence(
    crypto
      .keccak256(concatByteArrays(requestID, ByteArray.fromUTF8("0")))
      .toHexString()
  );
  evidence.request = request.id;
  evidence.URI = call.inputs._evidence;
  evidence.sender = call.from;
  evidence.save();
}
