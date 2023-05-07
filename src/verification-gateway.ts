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

function updateDailyStats(timestamp: BigInt, numWallets: BigInt, numOperationsSubmitted: BigInt, numOperationsFailed: BigInt, numWalletsRecovered: BigInt, numBundlesSubmitted: BigInt, numActionsSubmitted: BigInt): void {
  let dailyStatsID = getDailyStatsID(timestamp);
  let dailyStats = BlsWalletStatsTSEntity.load(dailyStatsID);

  if (dailyStats == null) {
    dailyStats = new BlsWalletStatsTSEntity(dailyStatsID);
    dailyStats.day = BigInt.fromString(dailyStatsID);
    dailyStats.numWallets = BigInt.fromI32(0);
    dailyStats.numOperationsFailed = BigInt.fromI32(0);
    dailyStats.numOperationsSubmitted = BigInt.fromI32(0);
    dailyStats.numWalletsRecovered = BigInt.fromI32(0);
    dailyStats.numBundlesSubmitted = BigInt.fromI32(0);
    dailyStats.numActionsSubmitted = BigInt.fromI32(0);
  }

  dailyStats.numWallets = dailyStats.numWallets.plus(numWallets);
  dailyStats.numOperationsSubmitted = dailyStats.numOperationsSubmitted.plus(numOperationsSubmitted);
  dailyStats.numOperationsFailed = dailyStats.numOperationsFailed.plus(numOperationsFailed);
  dailyStats.numWalletsRecovered = dailyStats.numWalletsRecovered.plus(numWalletsRecovered);
  dailyStats.numBundlesSubmitted = dailyStats.numBundlesSubmitted.plus(numBundlesSubmitted);
  dailyStats.numActionsSubmitted = dailyStats.numActionsSubmitted.plus(numActionsSubmitted);

  dailyStats.save();
}


export function handleWalletCreated(event: WalletCreated): void {
  let id = event.transaction.hash.toHex();
  let entity = new WalletCreatedEntity(id);
  entity.wallet = event.params.wallet;
  entity.publicKey = event.params.publicKey;
  entity.save();

  let stats = BlsWalletStatsSumsEntity.load("all");
  if (stats == null) {
    stats = new BlsWalletStatsSumsEntity("all");
    stats.numWallets = BigInt.fromI32(0);
    stats.numOperationsSubmitted = BigInt.fromI32(0);
    stats.numOperationsFailed = BigInt.fromI32(0);
    stats.numWalletsRecovered = BigInt.fromI32(0);
    stats.numBundlesSubmitted = BigInt.fromI32(0);
    stats.numActionsSubmitted = BigInt.fromI32(0);
  }

  // Update the appropriate statistics based on the result of the wallet operation
  stats.numWallets = stats.numWallets.plus(BigInt.fromI32(1));  
  stats.save();

  updateDailyStats(event.block.timestamp, BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));

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


  let stats = BlsWalletStatsSumsEntity.load("all");
  if (stats == null) {
    stats = new BlsWalletStatsSumsEntity("all");  
    stats.numWallets = BigInt.fromI32(0);
    stats.numOperationsSubmitted = BigInt.fromI32(0);
    stats.numOperationsFailed = BigInt.fromI32(0);
    stats.numWalletsRecovered = BigInt.fromI32(0);
    stats.numBundlesSubmitted = BigInt.fromI32(0);
    stats.numActionsSubmitted = BigInt.fromI32(0);
  }

  for (let i = 0; i < event.params.actions.length; i++) {
    let action = event.params.actions[i];
    actions.push(action[0].toBigInt());
    recipients.push(action[1].toAddress());
    data.push(action[2].toBytes());
    methodIds.push(Bytes.fromHexString(action[2].toBytes().toHexString().slice(0, 10)));
    stats.numActionsSubmitted = stats.numActionsSubmitted.plus(BigInt.fromI32(1));
  }
  
  entity.actionsNonce = actions;
  entity.actionsRecipients = recipients;
  entity.actionsData = data;
  entity.actionsMethodIds = methodIds;

  entity.save();

  
  // Update the appropriate statistics based on the result of the wallet operation
  stats.numOperationsSubmitted = stats.numOperationsSubmitted.plus(BigInt.fromI32(1));
  if (event.params.success == false) {
    stats.numOperationsFailed = stats.numOperationsFailed.plus(BigInt.fromI32(1));
  }

  // Check if the transaction has already been processed
  let processedTransaction = ProcessedTransactionEntity.load(id);
  if (processedTransaction == null) {
    // Create a new ProcessedTransactionEntity for this transaction hash
    let newProcessedTransaction = new ProcessedTransactionEntity(id);
    newProcessedTransaction.transactionHash = event.transaction.hash;
    newProcessedTransaction.numOperations = BigInt.fromI32(1);
    newProcessedTransaction.save();
    // Increment numBundlesSubmitted by 1
    stats.numBundlesSubmitted = stats.numBundlesSubmitted.plus(BigInt.fromI32(1));
    updateDailyStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0));
  } else {
    processedTransaction.numOperations = processedTransaction.numOperations.plus(BigInt.fromI32(1));
    processedTransaction.save();
  }
  stats.save();

  let success = event.params.success ? BigInt.fromI32(0) : BigInt.fromI32(1);
  updateDailyStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(1), success, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(event.params.actions.length));
  
}

export function handleBLSKeySetForWallet(
  event: BLSKeySetForWallet): void {
  if (event.transaction.input.toHexString().slice(0,10) == "ee4720f3") {

    let stats = BlsWalletStatsSumsEntity.load("all")

    if (stats == null) {
      stats = new BlsWalletStatsSumsEntity("all");
      stats.numWallets = BigInt.fromI32(0);
      stats.numOperationsSubmitted = BigInt.fromI32(0);
      stats.numOperationsFailed = BigInt.fromI32(0);
      stats.numWalletsRecovered = BigInt.fromI32(0);
      stats.numBundlesSubmitted = BigInt.fromI32(0);
      stats.numActionsSubmitted = BigInt.fromI32(0);
    }
    stats.numWalletsRecovered = stats.numWalletsRecovered.plus(BigInt.fromI32(1));
    stats.save();

    updateDailyStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0));
  } 
}
