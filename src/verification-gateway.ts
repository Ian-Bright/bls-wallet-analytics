import { BigInt, Bytes, ByteArray, bigDecimal } from "@graphprotocol/graph-ts"
import {
  verificationGateway,
  BLSKeySetForWallet,
  // PendingBLSKeySet,
  WalletCreated,
  WalletOperationProcessed,
  RecoverWalletCall,
} from "../generated/verificationGateway/verificationGateway"
import {
  WalletOperationProcessedEntity,
  WalletCreatedEntity,
  BlsWalletStatsSumsEntity,
  ProcessedTransactionEntity,
  BlsWalletStatsTSEntity,
} from "../generated/schema"

// export function handlePendingBLSKeySet(event: PendingBLSKeySet): void {}

function getDailyStatsID(timestamp: BigInt): string {
  let dayInMillis = BigInt.fromI32(86400); // 24 hours * 60 minutes * 60 seconds
  let dayID = timestamp.div(dayInMillis);
  return dayID.toString();
}

function updateStats(
  timestamp: BigInt,
  numWalletsCreated: BigInt,
  numOperationsSubmitted: BigInt,
  numOperationsFailed: BigInt,
  numWalletsRecovered: BigInt,
  numBundlesSubmitted: BigInt,
  numActionsSubmitted: BigInt): void {
    let dailyStatsID = getDailyStatsID(timestamp);
    let dailyStats = BlsWalletStatsTSEntity.load(dailyStatsID);
    let summedId = "all";
    let summedStats = BlsWalletStatsSumsEntity.load("all");

    if (dailyStats == null) {
      dailyStats = new BlsWalletStatsTSEntity(dailyStatsID);
      dailyStats.day = BigInt.fromString(dailyStatsID);
      dailyStats.numWalletsCreated = BigInt.fromI32(0);
      dailyStats.numOperationsFailed = BigInt.fromI32(0);
      dailyStats.numOperationsSubmitted = BigInt.fromI32(0);
      dailyStats.numWalletsRecovered = BigInt.fromI32(0);
      dailyStats.numBundlesSubmitted = BigInt.fromI32(0);
      dailyStats.numActionsSubmitted = BigInt.fromI32(0);
    }

    if (summedStats == null) {
      summedStats = new BlsWalletStatsSumsEntity(summedId);
      summedStats.numWalletsCreated = BigInt.fromI32(0);
      summedStats.numOperationsSubmitted = BigInt.fromI32(0);
      summedStats.numOperationsFailed = BigInt.fromI32(0);
      summedStats.numWalletsRecovered = BigInt.fromI32(0);
      summedStats.numBundlesSubmitted = BigInt.fromI32(0);
      summedStats.numActionsSubmitted = BigInt.fromI32(0);
    }
    // Increment daily stats
    dailyStats.numWalletsCreated = dailyStats.numWalletsCreated.plus(numWalletsCreated);
    dailyStats.numOperationsSubmitted = dailyStats.numOperationsSubmitted.plus(numOperationsSubmitted);
    dailyStats.numOperationsFailed = dailyStats.numOperationsFailed.plus(numOperationsFailed);
    dailyStats.numWalletsRecovered = dailyStats.numWalletsRecovered.plus(numWalletsRecovered);
    dailyStats.numBundlesSubmitted = dailyStats.numBundlesSubmitted.plus(numBundlesSubmitted);
    dailyStats.numActionsSubmitted = dailyStats.numActionsSubmitted.plus(numActionsSubmitted);

    // Increment summed stats
    summedStats.numWalletsCreated = summedStats.numWalletsCreated.plus(numWalletsCreated);
    summedStats.numOperationsSubmitted = summedStats.numOperationsSubmitted.plus(numOperationsSubmitted);
    summedStats.numOperationsFailed = summedStats.numOperationsFailed.plus(numOperationsFailed);
    summedStats.numWalletsRecovered = summedStats.numWalletsRecovered.plus(numWalletsRecovered);
    summedStats.numBundlesSubmitted = summedStats.numBundlesSubmitted.plus(numBundlesSubmitted);
    summedStats.numActionsSubmitted = summedStats.numActionsSubmitted.plus(numActionsSubmitted);

    dailyStats.save();
    summedStats.save();
}

export function handleWalletCreated(event: WalletCreated): void {
  let id = event.transaction.hash.toHex();
  let entity = new WalletCreatedEntity(id);
  entity.wallet = event.params.wallet;
  entity.publicKey = event.params.publicKey;
  entity.save();

  // Add a wallet creation to the ts data 
  updateStats(event.block.timestamp, BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));

}

export function handleWalletOperationProcessed(
  event: WalletOperationProcessed
): void {
  let id = event.transaction.hash.toHex();
  let entity = new WalletOperationProcessedEntity(id);
  entity.wallet = event.params.wallet;
  entity.nonce = event.params.nonce;
  entity.success = event.params.success;
  entity.results = event.params.results;
  entity.transactionHash = event.transaction.hash;
  entity.numActions = BigInt.fromI32(event.params.actions.length);

  let actions = new Array<BigInt>();
  let recipients = new Array<Bytes>();
  let data = new Array<Bytes>();
  let methodIds = new Array<Bytes>();

  for (let i = 0; i < event.params.actions.length; i++) {
    let action = event.params.actions[i];
    actions.push(action[0].toBigInt());
    recipients.push(action[1].toAddress());
    data.push(action[2].toBytes());
    methodIds.push(Bytes.fromHexString(action[2].toBytes().toHexString().slice(0, 10)));
    // Add an action to the summed data
    updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1));
  }

  entity.actionsNonce = actions;
  entity.actionsRecipients = recipients;
  entity.actionsData = data;
  entity.actionsMethodIds = methodIds;

  entity.save();


  // increment the number of operations
  updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
  if (event.params.success == false) {
    // increment the number of operations failed
    updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
  }

  // Check if the transaction has already been processed
  let processedTransaction = ProcessedTransactionEntity.load(id);
  if (processedTransaction == null) {
    // Create a new ProcessedTransactionEntity for this transaction hash
    let newProcessedTransaction = new ProcessedTransactionEntity(id);
    newProcessedTransaction.transactionHash = event.transaction.hash;
    newProcessedTransaction.numOperations = BigInt.fromI32(1);
    newProcessedTransaction.save();
    // Increment numBundlesSubmitted by 1 for the ts data
    updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0));
  } else {
    processedTransaction.numOperations = processedTransaction.numOperations.plus(BigInt.fromI32(1));
    processedTransaction.save();
  }
}

export function handleBLSKeySetForWallet(
  event: BLSKeySetForWallet): void {
  if (event.transaction.input.toHexString().slice(0, 10) == "ee4720f3") {
    updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0));
  }
}
