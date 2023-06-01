SELECT
  numWalletsCreated as Num_Wallets_Created,  
  numWalletsRecovered as Num_Wallets_Recovered,
  numBundlesSubmitted as Num_Bundles_Submitted,
  numOperationsSubmitted as Num_Operations_Submitted,
  numOperationsFailed as Num_Operations_Failed,
  numActionsSubmitted as Num_Actions_Submitted,
  ROUND(avgOperationsPerBundle, 2) as Avg_Operations_Per_Bundle,
  ROUND(avgActionsPerBundle, 2) as Avg_Actions_Per_Bundle,
  ROUND(avgActionsPerOperation, 2) as Avg_Actions_Per_Operation,
  minGas,
  maxGas, 
  ROUND(avgGas, 0) as Avg_Gas
FROM 
  `blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_sums_entities` 