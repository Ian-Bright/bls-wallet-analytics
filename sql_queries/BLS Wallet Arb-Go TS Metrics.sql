WITH 
  min_max AS (
    SELECT 
      MIN(DATE(TIMESTAMP_SECONDS(id * 86400))) as start_date,
      MAX(DATE(TIMESTAMP_SECONDS(id * 86400))) as end_date
    FROM
      blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_ts_entities
  ),
  date_range AS (
    SELECT 
      date
    FROM 
      UNNEST(GENERATE_DATE_ARRAY((SELECT start_date FROM min_max), (SELECT end_date FROM min_max))) AS date
  )
SELECT
  date_range.date AS day,  
  IFNULL(entities.numWalletsCreated, 0) as Num_Wallets_Created,  
  IFNULL(entities.numWalletsRecovered, 0) as Num_Wallets_Recovered,  
  IFNULL(entities.numBundlesSubmitted, 0) as Num_Bundles_Submitted, 
  IFNULL(entities.numOperationsSubmitted, 0) as Num_Operations_Submitted,
  IFNULL(entities.numOperationsFailed, 0) as Num_Operations_Failed,
  IFNULL(entities.numActionsSubmitted, 0) as Num_Actions_Submitted,
  IFNULL(ROUND(entities.avgOperationsPerBundle, 2), 0) as Avg_Operations_Per_Bundle,
  IFNULL(ROUND(entities.avgActionsPerBundle, 2), 0) as Avg_Actions_Per_Bundle,
  IFNULL(ROUND(entities.avgActionsPerOperation, 2), 0) as Avg_Actions_Per_Operation,
  IFNULL(entities.minGas, 0) as minGas, 
  IFNULL(entities.maxGas, 0) as maxGas,
  IFNULL(entities.avgGas, 0) as avgGas
FROM 
  date_range
LEFT JOIN 
  blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_ts_entities AS entities
ON 
  date_range.date = DATE(TIMESTAMP_SECONDS(entities.id * 86400))
ORDER BY
  day 