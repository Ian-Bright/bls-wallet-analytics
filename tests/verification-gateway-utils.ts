import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  BLSKeySetForWallet,
  PendingBLSKeySet,
  WalletCreated,
  WalletOperationProcessed
} from "../generated/verificationGateway/verificationGateway"

export function createBLSKeySetForWalletEvent(
  newBLSKey: Array<BigInt>,
  wallet: Address
): BLSKeySetForWallet {
  let blsKeySetForWalletEvent = changetype<BLSKeySetForWallet>(newMockEvent())

  blsKeySetForWalletEvent.parameters = new Array()

  blsKeySetForWalletEvent.parameters.push(
    new ethereum.EventParam(
      "newBLSKey",
      ethereum.Value.fromUnsignedBigIntArray(newBLSKey)
    )
  )
  blsKeySetForWalletEvent.parameters.push(
    new ethereum.EventParam("wallet", ethereum.Value.fromAddress(wallet))
  )

  return blsKeySetForWalletEvent
}

export function createPendingBLSKeySetEvent(
  previousHash: Bytes,
  newBLSKey: Array<BigInt>
): PendingBLSKeySet {
  let pendingBlsKeySetEvent = changetype<PendingBLSKeySet>(newMockEvent())

  pendingBlsKeySetEvent.parameters = new Array()

  pendingBlsKeySetEvent.parameters.push(
    new ethereum.EventParam(
      "previousHash",
      ethereum.Value.fromFixedBytes(previousHash)
    )
  )
  pendingBlsKeySetEvent.parameters.push(
    new ethereum.EventParam(
      "newBLSKey",
      ethereum.Value.fromUnsignedBigIntArray(newBLSKey)
    )
  )

  return pendingBlsKeySetEvent
}

export function createWalletCreatedEvent(
  wallet: Address,
  publicKey: Array<BigInt>
): WalletCreated {
  let walletCreatedEvent = changetype<WalletCreated>(newMockEvent())

  walletCreatedEvent.parameters = new Array()

  walletCreatedEvent.parameters.push(
    new ethereum.EventParam("wallet", ethereum.Value.fromAddress(wallet))
  )
  walletCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "publicKey",
      ethereum.Value.fromUnsignedBigIntArray(publicKey)
    )
  )

  return walletCreatedEvent
}

export function createWalletOperationProcessedEvent(
  wallet: Address,
  nonce: BigInt,
  actions: Array<ethereum.Tuple>,
  success: boolean,
  results: Array<Bytes>
): WalletOperationProcessed {
  let walletOperationProcessedEvent = changetype<WalletOperationProcessed>(
    newMockEvent()
  )

  walletOperationProcessedEvent.parameters = new Array()

  walletOperationProcessedEvent.parameters.push(
    new ethereum.EventParam("wallet", ethereum.Value.fromAddress(wallet))
  )
  walletOperationProcessedEvent.parameters.push(
    new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce))
  )
  walletOperationProcessedEvent.parameters.push(
    new ethereum.EventParam("actions", ethereum.Value.fromTupleArray(actions))
  )
  walletOperationProcessedEvent.parameters.push(
    new ethereum.EventParam("success", ethereum.Value.fromBoolean(success))
  )
  walletOperationProcessedEvent.parameters.push(
    new ethereum.EventParam("results", ethereum.Value.fromBytesArray(results))
  )

  return walletOperationProcessedEvent
}
