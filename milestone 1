# BLS Wallet Project Milestone 1:

## Deliverable 1: https://github.com/Ian-Bright/bls-wallet-analytics
Nothing too fancy yet. We will upload the grant doc, this doc, and all queries as the are written.

## Deliverable 2: BLS Wallet Research

The purpose of this flow is to understand the contracts of BLS Wallet and how users interact with them.
Resources:
* https://github.com/web3well/bls-wallet
* https://github.com/web3well/bls-wallet/blob/main/docs/system_overview.md
* https://github.com/web3well/bls-wallet/blob/main/contracts/networks/arbitrum-goerli.json
* https://github.com/web3well/bls-wallet/blob/main/contracts/networks/optimism-goerli.json
* https://github.com/web3well/bls-wallet/tree/main/contracts
* https://github.com/web3well/bls-wallet/blob/main/contracts/ArbitrumGasCosts.md
* https://github.com/web3well/bls-wallet/blob/main/contracts/ArbitrumL1GasCosts.md



### The Flow:
#### General Idea: 
BLS signature validation is one of the most expensive parts of EVM transactions. BLS wallet can aggregate many signatures together off chain, which allows for both significant gas savings, and the ability to realize the benefits of account abstraction.
#### From a User Perspective:
1. dApp provides an operation which is a series of actions, such as approving tokens and then sending them to a liquidity pool.
2. The user signs the operation and send it to the L2 (via aggregation module)
3. They wait for a bundle of operations, including their own, to be collected and aggregated by a server or L2. The bundle is placed on chain, expanded, and verified before being sent to the user L2 Smart Contract wallet as an operation
4. The actions are sent through to the dApp contract on the L2 

Benefits:
1. Cheaper gas costs due to BLS batching
2. Smart Contract Wallet benefits w/o the gas drawbacks
3. Better UX due to a single signing of an operation, vs a sequential seperate transaction signing then waiting needed currently.  (think adding to  a Uniswap LP with approval then adding the funds to the lp)
4. Increase user security by ending each operation with a token permission revoke (this seems like a huge deal btw)

Questions:
* How does the user estimate gas costs? **there is an estimate function call**
* Is full operation atomic, sequential with a break if one fails, or individual? **fully atomic**
* What kind of delays do you expect at scale due to aggregation?
* How do you view the UX tradeoff of that delay?
* What guarantees can you give users they won't be front run or MEV'd?

#### From a Dapp Perspective:
1. The dApp creates an operation for their users, which is a series of actions the user needs to achieve a goal on the protocol
2. The dApp contracts on the L2 EVM wait for the actions to call thier functions as normal

Benefits:
1. Better UX for users with single operation signing vs many action signing
2. Better dApp competitiveness due to gas efficiency

Questions
1. How does the dApp build the operation? Just a flow of transaction calls within thier contract?

#### From a Server/L2 Perspective:
1. The Server/L2 recieves a series of signed operations from BLS client modules, including a reward for including them into a bundle 
2. The Server aggregates the operations into one single operation signed by a single BLS signature
    a. The Server chooses the bundles included by maximizing its reward
    b. The Server reduces call data as much as possible to increase the number of bundles and thus rewards
3. The Server then passes the single signed bundle into a smart contract on an L2 EVM called ["BLS Expander"](https://goerli.arbiscan.io/address/0x4473e39a5F33A83B81387bb5F816354F04E724a3)
4. The server is then finished! 

Benefits:
1. Server gets a reward for aggregating Operations and submitting the bundle to the L2 EVM Smart Contracts 

Questions
1. Am I correct about the rewards?
2. Why do I not see operations going through the expander contract? **it's not currently being used**

#### From an On-Chain Perspective:
1. The ["blsExpander"](https://goerli.arbiscan.io/address/0x4473e39a5F33A83B81387bb5F816354F04E724a3) contract recieves a bundle of operations signed in one aggregated signature by the Server/L2, and expands any compressed call data.
2. The ["verificationGateway"](https://goerli.arbiscan.io/address/0xae7DF242c589D479A5cF8fEA681736e0E0Bb1FB9) contract recieves the expanded version of the single signed operation and verifies each operation against the aggregated signatures. It then passes each operation on to its corresponding smart contract wallet to be proccessed
3. Each smart contract wallet then performs each action one at a time reverting the entire operation if any individual action does not succeed

There are a group of 7 Smart Contracts deployed On-Chain:
*  ["create2Deployer"](https://github.com/web3well/bls-wallet/blob/main/contracts/contracts/Create2Deployer.sol), [Arbitrum Goerli Contract](https://goerli.arbiscan.io/address/0x036d996D6855B83cd80142f2933d8C2617dA5617): 
    *  Creates smart contract wallets on chain with method id 0x61ff715f corresponding to the function: deploy(uint256 salt, bytes memory code), which when called...
    *  Emits the event topic signature: 0x0f7cceb5b8900763db0b46908960abf22a5d055a4a7395b6b83862d93f241d21 corresponding to event Deployed(address sender, uint256 salt, address addr)
    *  Also allows for predicting the address of the wallet using addressFrom(sender, salt, address)
* ["precompileCostEstimator"](https://github.com/web3well/bls-wallet/blob/main/contracts/contracts/lib/hubble-contracts/contracts/libs/BNPairingPrecompileCostEstimator.sol), [Arbitrum Goerli Contract](https://goerli.arbiscan.io/address/0x22E4a5251C1F02de8369Dd6f192033F6CB7531A4): 
    * Calls the "run()" function with method id "0xc0406226"
    * Purpose is to ensure users know the cost of the transaction before signing?
    * run() function calls the evm precompile 0x0...08
* ["blsLibrary (BLS.sol?)"](https://github.com/web3well/bls-wallet/blob/main/contracts/contracts/lib/BLS.sol), ["Arbitrum Goerli Contract"](https://goerli.arbiscan.io/address/0xF8a11BA6eceC43e23c9896b857128a4269290e39) 
* ["verificationGateway"](https://github.com/web3well/bls-wallet/blob/main/contracts/contracts/VerificationGateway.sol), ["Arbitrum Goerli Contract"](https://goerli.arbiscan.io/address/0xae7DF242c589D479A5cF8fEA681736e0E0Bb1FB9)
    * Events:
        * WalletCreated(address indexed wallet, uint256[BLS_KEY_LEN] public key)
            * This event is emitted when the function "getOrCreateWallet" is called and the wallet is successfully created (vs. the "get")
            * The event hash is:
                *      "104697c39000e0a8b4b6674e2135249b706ce25b9520756ba9b37e71ee0a688d":"WalletCreated(address,uint256[4])" 
        * WalletOperationProcessed(address indexed wallet, uint256 nonce, IWallet.ActionData[] actions, bool success, bytes[] results)
            * This event is emitted when the function "processBundle" is called and a wallet operation is processed
            * The event hash is 
                *      "9872451083cef0fc4232916d3eef8f2267edb3d496db39434a0d3142a27df456":"WalletOperationProcessed(address,uint256,(uint256,address,bytes)[],bool,bytes[])" 
        * event PendingBLSKeySet(bytes32 previousHash, uint256[BLS_KEY_LEN] newBLSKey)
            * This event is emitted when the function "setBLSKeyForWallet()" is called and a user already has a BLS key registered.  Then the function sets the delay to 1 week from the timestamp for the BLS key being reset?
            * The event hash is
                *      "a4d5c6d1a8cf3f0293863e628d821fc77f52703668f3db9602a561920b80e3c5":"PendingBLSKeySet(bytes32,uint256[4])" 
        * event BLSKeySetForWallet(uint256[BLS_KEY_LEN] newBLSKey, IWallet wallet)
            * This event is emitted when the function "safeSetWallet" is called successfully
            * The event hash is 
                *      "ed7fa84b11d72880f9a0b731f2e3b30dbce2449df6e947a3a1d69cbedf0431de": "BLSKeySetForWallet(uint256[4],address)"
                *  
    * Functions:
        *     "c65cd289": "processBundle((uint256[2],uint256[4][],(uint256,(uint256,address,bytes)[])[]))"
            * We could use this to tally when a bundle is processed
            * There is an event in the for loop then the event is called
        *     "a6afbbff": "recoverWallet(uint256[2],bytes32,bytes32,uint256[4])"
            * We could use this to collect the number of wallet recoveries
        *     "a890347e": "blsLib()"
        *     "d77bb5af": "blsWalletLogic()"
        *     "a725268a": "hashFromWallet(address)"
        *     "a6c5a6cc": "pendingBLSPublicKeyFromHash(bytes32,uint256)"
        *     "c1026678": "pendingBLSPublicKeyTimeFromHash(bytes32)"
        *     "dda0ac0a": "pendingMessageSenderSignatureFromHash(bytes32,uint256)"
        *     "34de62ba": "setBLSKeyForWallet(uint256[2],uint256[4])"
        *     "14d1a12b": "setPendingBLSKeyForWallet()"
        *     "d76b9850": "setTrustedBLSGateway(bytes32,address)"
        *     "ab7293b2": "verify((uint256[2],uint256[4][],(uint256,(uint256,address,bytes)[])[]))"
        *     "50e1d8bf": "walletAdminCall(bytes32,bytes)"
        *     "470c3046": "walletFromHash(bytes32)"
        *     "5c0dce40": "walletProxyAdmin()"
* ["BLSExpander"](https://github.com/web3well/bls-wallet/blob/main/contracts/contracts/BLSExpander.sol), [Arbitrum Goerli](https://goerli.arbiscan.io/address/0x4473e39a5F33A83B81387bb5F816354F04E724a3)
    * Functions:
        *     "9a29341c": "addressProcessBundle((uint256[2],address[],(uint256,(uint256,address,bytes)[])[]))"
        *     "58402bc0": "addressToPublicKey(address,uint256)",
        *     "9e03b803": "blsCallMultiCheckRewardIncrease(address,uint256,(uint256[2],uint256[4][],(uint256,(uint256,address,bytes)[])[]))",
        *     "578e3d44": "blsCallMultiSameCallerContractFunction(uint256[4],uint256,uint256[2],address,bytes4,bytes[])",
        *     "e5f3f00d": "registerPublicKey(address,uint256[4])",
        *     "194efdd1": "registerPublicKeys(address[],uint256[4][])"
* ["BLSWallet"](https://github.com/web3well/bls-wallet/blob/main/contracts/contracts/BLSWallet.sol), [Arbitrum Goerli](https://goerli.arbiscan.io/address/0x4473e39a5F33A83B81387bb5F816354F04E724a3)
    * Functions:
        *     "f29bf334": "_performOperation((uint256,(uint256,address,bytes)[]))"
        *     "08b33e62": "approvedProxyAdminFunctionHash()",
        *     "7b1c3d1a": "clearApprovedProxyAdminFunctionHash()",
        *     "c4d66de8": "initialize(address)",
        *     "affed0e0": "nonce()",
        *     "e6616434": "performOperation((uint256,(uint256,address,bytes)[]))",
        *     "ce746024": "recover()",
        *     "6102495c": "recoveryHash()",
        *     "5f8b229b": "setAnyPending()",
        *     "c3f9e755": "setProxyAdminFunctionHash(bytes32)",
        *     "97fb4e1e": "setRecoveryHash(bytes32)",
        *     "8d1fafff": "setTrustedGateway(address)",
        *     "88a3b120": "trustedBLSGateway()"
## Deliverable 3: Metrics and Corresponding Functions/Events:
1. Number of wallets
    * Use the Event: WalletCreated in verification gateway 
3. Number of wallet recoveries
    * Use the Function: recoverWallet in verification gateway
5. Number of bundles submitted
    * Use the Function: proccessBundle
7. Number of operations submitted
    * Use the Event: walletOperationProccessed
    * Get the Failed Operations submitted too
9. Number of operations per bundle
    * **Use the event walletOperationProccessed per proccessBundle call**
<!--     * TODO (see below first): ask Jake If there is a good way to decipher the bundle object from input.  I would do it by length, but the bytes in the action will throw this off if they aren't a set length (which I assume they are not).
    * If events didn't work then look for each time a trace comes out of the verification gateway of the correct fxn sig hash. If all wallets are to behave as BLS Wallets then I would assume "performOperation" with method ID "0xe6616434".  can track each operation per Wallet. There is a bool for success or failure of the operation as an output of the function call that could also be picked up in the trace. I'm a little concerned that the integration of third party wallet providers will change this fxn call and break this. But... it would be easily fixed by adding the additional method ID for the fxn call, and we would know about it b/c the verification gateway contract would have to be altered.
        * This would basically be a count of "performOperation" contract calls per "proccessBundle" calls -->
11. Number of actions per operation
    * **We need to decode the action section in the events/functions**
    * The best way to handle this is likely by creating a udf by bringing in a java library that can decode the event "walletOperationProccessed" 
<!--     * Nothing in Events seems too obvious here from the contracts.
    * TO DO: ask Jake if the length of the array passed into "performOperation" is an indication of each "action" that will occur
        * The rub on this is potential arbitrary length of the bytes in the the operation call
        * If this is true, then we can check the length of the input of the trace calls out of the verification gateway, and confirm success by that trace's output -->
13. Number of failed actions/operations
    * If the "performOperation" with method ID "0xe6616434" is confirmed, then the output of the trace will include a bool for success or failure
    * Failures will be atomic and granularity is not needed
<!--     * TO DO:  ask Jake if "bytes[] memory results" output from performOperation is a record of the success/failure of the individual actions. My understanding is the whole operation is atomic.
    * If that is not what the "bytes[] memory" output is then it would be more complicated. A suggestion or two: -->
<!--         * look at the success of the call traces which are triggered by the performOperation call from the verificationGateway -->
15. Types of actions (transfer, mint, approval, etc.)
    * Use the UDF to decode the event operationProccessed
    * take the first 8 bytes of the "bytes" for each operation action to associate each action with a type
<!--     * Again this comes down to if the length of the input code is arbitrary with bytes[] 
    *  Worst case scenario, we can collect the subtrace methodIDs which come from the BLSWallet’s address after the proccessOperation() is called --> -->
16. Contract addresses interacted with
    * Use the UDF to decode the event operationProccessed
    * Take the "address" for each operation action to associate each action with the contract it is calling
<!--     *  To Do: Can we decipher this from the operation
    *  Again this comes down to if the length of the input code is arbitrary with bytes[] 
    *  Worst case scenario, we can collect the subtrace “to_address” which come from BLSWallet’s address after prccessOperation() is called -->
17. Min, max, and avg operation gas cost
    * Track this over time to see trends.
    * Track the operations to see if people are making more complex and better use of BLS Wallet
<!--     * We will also track per a couple common method ids for Brian's shits and giggles -->
<!--      * There are a number of places to find the gas used including
         * Transaction
         * Bundle
         * Actions
     * To Do: Ask Jake where it is helpful to track this at (from above)? 
     * We should grab this from the “trace” of the proccessOperation call.  It will have a gas used category.  -->
18. Gas saved from bundling transactions
    * If we collect this straight up we will need to understand what a comparable action would have cost.  This might require searching through transactions for the gas used to do the particular method ID that is being asked for.
    * We think we can accomplish this by creating a window function which will be a list of all the method ids called in all the actions. Then we'll get an average gas used in each block for each method id. Then we can make a comparison to the gas used for the total bundle of a certain number of actions based on the avg cost of the comparable transactions

## Deliverable 4 Design:
We can do custom colors, and will obviously lay things out better, but this is the general design space. Please let us know if there is anything specific that would be better with the design and brand of 
![](https://i.imgur.com/Nrmy8iQ.png)

![](https://i.imgur.com/fto3Of6.png)



