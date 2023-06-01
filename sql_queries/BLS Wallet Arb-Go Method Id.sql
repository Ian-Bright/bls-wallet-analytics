SELECT  
  DATE(TIMESTAMP_SECONDS(id * 86400)) as day,
  actionMethodId,
  COUNT(*) AS action_count
FROM 
  `blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_ts_entities`, 
  UNNEST(`blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_ts_entities`.actionMethodIds) AS actionMethodId
GROUP BY
  actionMethodId,
  day
ORDER BY
  day