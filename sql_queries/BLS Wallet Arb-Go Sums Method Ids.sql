SELECT  
  actionMethodId,
  COUNT(*) AS action_count
FROM 
  `blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_sums_entities`,
  UNNEST(`blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_sums_entities`.actionMethodIds) AS actionMethodId
GROUP BY
  actionMethodId
