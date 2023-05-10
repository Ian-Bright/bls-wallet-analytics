import { BigInt, Bytes, BigDecimal, log } from "@graphprotocol/graph-ts"
import {
  BLSKeySetForWallet,
  WalletCreated,
  WalletOperationProcessed,
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
  numActionsSubmitted: BigInt,
  methodIds: Array<Bytes>,
  recipients: Array<Bytes>,
  gas: BigInt,
  ): void {
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
      dailyStats.avgOperationsPerBundle = BigDecimal.fromString("0");
      dailyStats.avgActionsPerBundle = BigDecimal.fromString("0");
      dailyStats.avgActionsPerOperation = BigDecimal.fromString("0");
      dailyStats.actionMethodIds = new Array<Bytes>();
      dailyStats.actionsRecipients = new Array<Bytes>();
      dailyStats.minGas = BigInt.fromI32(0);
      dailyStats.maxGas = BigInt.fromI32(0);
      dailyStats.avgGas = BigDecimal.fromString("0");
      dailyStats.totalGas = BigInt.fromI32(0);
    }

    if (summedStats == null) {
      summedStats = new BlsWalletStatsSumsEntity(summedId);
      summedStats.numWalletsCreated = BigInt.fromI32(0);
      summedStats.numOperationsSubmitted = BigInt.fromI32(0);
      summedStats.numOperationsFailed = BigInt.fromI32(0);
      summedStats.numWalletsRecovered = BigInt.fromI32(0);
      summedStats.numBundlesSubmitted = BigInt.fromI32(0);
      summedStats.numActionsSubmitted = BigInt.fromI32(0);
      summedStats.avgOperationsPerBundle = BigDecimal.fromString("0");
      summedStats.avgActionsPerBundle = BigDecimal.fromString("0");
      summedStats.avgActionsPerOperation = BigDecimal.fromString("0");
      summedStats.actionMethodIds = new Array<Bytes>();
      summedStats.actionsRecipients = new Array<Bytes>();
      summedStats.minGas = BigInt.fromI32(0);
      summedStats.maxGas = BigInt.fromI32(0);
      summedStats.avgGas = BigDecimal.fromString("0");
      summedStats.totalGas = BigInt.fromI32(0);
    }
    // Increment daily stats
    dailyStats.numWalletsCreated = dailyStats.numWalletsCreated.plus(numWalletsCreated);
    dailyStats.numOperationsSubmitted = dailyStats.numOperationsSubmitted.plus(numOperationsSubmitted);
    dailyStats.numOperationsFailed = dailyStats.numOperationsFailed.plus(numOperationsFailed);
    dailyStats.numWalletsRecovered = dailyStats.numWalletsRecovered.plus(numWalletsRecovered);
    dailyStats.numBundlesSubmitted = dailyStats.numBundlesSubmitted.plus(numBundlesSubmitted);
    dailyStats.numActionsSubmitted = dailyStats.numActionsSubmitted.plus(numActionsSubmitted);

    // Calculate average operations per bundle for daily stats
    if (dailyStats.numBundlesSubmitted != BigInt.fromI32(0)) {
      dailyStats.avgOperationsPerBundle = dailyStats.numOperationsSubmitted.toBigDecimal().div(dailyStats.numBundlesSubmitted.toBigDecimal());
    } else {
      dailyStats.avgOperationsPerBundle = BigDecimal.fromString("0");
    };
    // Calculate average actions per bundle for daily stats
    if (dailyStats.numBundlesSubmitted != BigInt.fromI32(0)) {
      dailyStats.avgActionsPerBundle = dailyStats.numActionsSubmitted.toBigDecimal().div(dailyStats.numBundlesSubmitted.toBigDecimal());
    } else {
      dailyStats.avgActionsPerBundle = BigDecimal.fromString("0");
    };
    // Calculate average actions per operations for daily stats
    if (dailyStats.numOperationsSubmitted != BigInt.fromI32(0)) {
      dailyStats.avgActionsPerOperation = dailyStats.numActionsSubmitted.toBigDecimal().div(dailyStats.numOperationsSubmitted.toBigDecimal());
    } else {
      dailyStats.avgActionsPerOperation = BigDecimal.fromString("0");
    };


    // Increment summed stats
    summedStats.numWalletsCreated = summedStats.numWalletsCreated.plus(numWalletsCreated);
    summedStats.numOperationsSubmitted = summedStats.numOperationsSubmitted.plus(numOperationsSubmitted);
    summedStats.numOperationsFailed = summedStats.numOperationsFailed.plus(numOperationsFailed);
    summedStats.numWalletsRecovered = summedStats.numWalletsRecovered.plus(numWalletsRecovered);
    summedStats.numBundlesSubmitted = summedStats.numBundlesSubmitted.plus(numBundlesSubmitted);
    summedStats.numActionsSubmitted = summedStats.numActionsSubmitted.plus(numActionsSubmitted);


    // Calculate average operations per bundle for summed stats
    if (summedStats.numBundlesSubmitted != BigInt.fromI32(0)) {
      summedStats.avgOperationsPerBundle = summedStats.numOperationsSubmitted.toBigDecimal().div(summedStats.numBundlesSubmitted.toBigDecimal());
    } else {
      summedStats.avgOperationsPerBundle = BigDecimal.fromString("0");
    }
    // Calculate average actions per bundle for for summed stats
    if (summedStats.numBundlesSubmitted != BigInt.fromI32(0)) {
      summedStats.avgActionsPerBundle = summedStats.numActionsSubmitted.toBigDecimal().div(summedStats.numBundlesSubmitted.toBigDecimal());
    } else {
      summedStats.avgOperationsPerBundle = BigDecimal.fromString("0");
    };
    // Calculate average actions per operations for for summed stats
    if (summedStats.numOperationsSubmitted != BigInt.fromI32(0)) {
      summedStats.avgActionsPerOperation = summedStats.numActionsSubmitted.toBigDecimal().div(summedStats.numOperationsSubmitted.toBigDecimal());
    } else {
      summedStats.avgActionsPerOperation = BigDecimal.fromString("0");
    };

    if (methodIds.length > 0) {
      dailyStats.actionMethodIds = dailyStats.actionMethodIds.concat(methodIds);
      summedStats.actionMethodIds = summedStats.actionMethodIds.concat(methodIds);
      dailyStats.actionsRecipients = dailyStats.actionsRecipients.concat(recipients);
      summedStats.actionsRecipients = summedStats.actionsRecipients.concat(recipients);
    }

    // Calculate min gas for daily stats
    if (dailyStats.minGas == BigInt.fromI32(0) || gas < dailyStats.minGas) {
      dailyStats.minGas = gas;
    }
    // Calculate max gas for daily stats
    if (dailyStats.maxGas == BigInt.fromI32(0) || gas > dailyStats.maxGas) {
      dailyStats.maxGas = gas;
    }
    // Calculate average gas for daily stats
    if (dailyStats.numBundlesSubmitted != BigInt.fromI32(0)) {
      dailyStats.totalGas = dailyStats.totalGas.plus(gas);
      dailyStats.avgGas = BigDecimal.fromString(dailyStats.totalGas.toString()).div(BigDecimal.fromString(dailyStats.numBundlesSubmitted.toString()));
    }

    // Calculate min gas for summed stats
    if (summedStats.minGas == BigInt.fromI32(0) || gas < summedStats.minGas) {
      summedStats.minGas = gas;
    }
    // Calculate max gas for summed stats
    if (summedStats.maxGas == BigInt.fromI32(0) || gas > summedStats.maxGas) {
      summedStats.maxGas = gas;
    }
    // Calculate average gas for summed stats
    if (summedStats.numBundlesSubmitted != BigInt.fromI32(0)) {
      summedStats.totalGas = summedStats.totalGas.plus(gas);
      summedStats.avgGas = BigDecimal.fromString(summedStats.totalGas.toString()).div(BigDecimal.fromString(summedStats.numBundlesSubmitted.toString()));
    }


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
  updateStats(event.block.timestamp, BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), [], [], BigInt.fromI32(0));

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
    let methodId = Bytes.fromUint8Array(action[2].toBytes().slice(0, 4));
    methodIds.push(methodId);  }
  
  updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(methodIds.length), methodIds, recipients, BigInt.fromI32(0));

  entity.actionsNonce = actions;
  entity.actionsRecipients = recipients;
  entity.actionsData = data;
  entity.actionsMethodIds = methodIds;

  entity.save();


  // increment the number of operations
  updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), [], [], BigInt.fromI32(0));
  if (event.params.success == false) {
    // increment the number of operations failed
    updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), [], [], BigInt.fromI32(0));
  }

  // Check if the transaction has already been processed
  let processedTransaction = ProcessedTransactionEntity.load(id);
  if (processedTransaction == null) {
    // Create a new ProcessedTransactionEntity for this transaction hash
    let newProcessedTransaction = new ProcessedTransactionEntity(id);
    newProcessedTransaction.transactionHash = event.transaction.hash;
    newProcessedTransaction.numOperations = BigInt.fromI32(1);
    newProcessedTransaction.save();

    let gas = event.transaction.gasPrice.times(event.transaction.gasLimit);
    
    // Increment numBundlesSubmitted by 1 for the ts data
    updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), [], [], gas);
  } else {
    processedTransaction.numOperations = processedTransaction.numOperations.plus(BigInt.fromI32(1));
    processedTransaction.save();
  }
}

export function handleBLSKeySetForWallet(
  event: BLSKeySetForWallet): void {
  if (event.transaction.input.toHexString().slice(0, 10) == "ee4720f3") {
    updateStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(1), BigInt.fromI32(0), BigInt.fromI32(0), [], [], BigInt.fromI32(0));
  }
}