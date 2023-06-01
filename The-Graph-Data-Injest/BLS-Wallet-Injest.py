import os
import requests
from google.cloud import bigquery
from functions_framework import http

# Set up the Google BigQuery client
client = bigquery.Client()
# Define the schema of your BigQuery table
sums_schema = [
    bigquery.SchemaField("numWalletsCreated", "INTEGER"),
    bigquery.SchemaField("numOperationsFailed", "INTEGER"),
    bigquery.SchemaField("numWalletsRecovered", "INTEGER"),
    bigquery.SchemaField("numBundlesSubmitted", "INTEGER"),
    bigquery.SchemaField("numActionsSubmitted", "INTEGER"),
    bigquery.SchemaField("numOperationsSubmitted", "INTEGER"),
    bigquery.SchemaField("avgOperationsPerBundle", "FLOAT"),
    bigquery.SchemaField("avgActionsPerBundle", "FLOAT"),
    bigquery.SchemaField("avgActionsPerOperation", "FLOAT"),
    bigquery.SchemaField("minGas", "FLOAT"),
    bigquery.SchemaField("maxGas", "FLOAT"),
    bigquery.SchemaField("avgGas", "FLOAT"),
    bigquery.SchemaField("actionsRecipients", "STRING", mode="REPEATED"),  # Repeated field for list data
    bigquery.SchemaField("actionMethodIds", "STRING", mode="REPEATED"),
]

ts_schema = [
    bigquery.SchemaField("id", "INTEGER"),
    bigquery.SchemaField("numWalletsCreated", "INTEGER"),
    bigquery.SchemaField("numOperationsFailed", "INTEGER"),
    bigquery.SchemaField("numWalletsRecovered", "INTEGER"),
    bigquery.SchemaField("numBundlesSubmitted", "INTEGER"),
    bigquery.SchemaField("numActionsSubmitted", "INTEGER"),
    bigquery.SchemaField("numOperationsSubmitted", "INTEGER"),
    bigquery.SchemaField("avgOperationsPerBundle", "FLOAT"),
    bigquery.SchemaField("avgActionsPerBundle", "FLOAT"),
    bigquery.SchemaField("avgActionsPerOperation", "FLOAT"),
    bigquery.SchemaField("minGas", "FLOAT"),
    bigquery.SchemaField("maxGas", "FLOAT"),
    bigquery.SchemaField("avgGas", "FLOAT"),
    bigquery.SchemaField("actionsRecipients", "STRING", mode="REPEATED"),  # Repeated field for list data
    bigquery.SchemaField("actionMethodIds", "STRING", mode="REPEATED"),
]

query = """
{
	blsWalletStatsSumsEntities(first: 1) {
    numWalletsCreated
    numOperationsFailed
    numWalletsRecovered
    numBundlesSubmitted
    numActionsSubmitted
    numOperationsSubmitted
    avgOperationsPerBundle
    avgActionsPerBundle
    avgActionsPerOperation
    minGas
    maxGas
    avgGas
    actionsRecipients
    actionMethodIds
  }
	blsWalletStatsTSEntities(first: 1000) {
    id
    numWalletsCreated
    numOperationsFailed
    numWalletsRecovered
    numBundlesSubmitted
    numActionsSubmitted
    numOperationsSubmitted
    avgOperationsPerBundle
    avgActionsPerBundle
    avgActionsPerOperation
    minGas
    maxGas
    avgGas
    actionsRecipients
    actionMethodIds
  }
}
"""

# Set up the headers for the API request
headers = {
    "Content-Type": "application/json",
}

@http
def load_data(request):
    # Set up the request to The Graph API
    response_optimism = requests.post(
        "https://api.thegraph.com/subgraphs/name/outsider-analytics/bls-wallet-optimism-goerli",
        headers=headers,
        json={"query": query},
    )
    
    # Parse the JSON response from The Graph API
    data = response_optimism.json()["data"]["blsWalletStatsSumsEntities"]

    table_id = "blocktrekker.the_graph_data.bls_wallet_optimism_goerli_stats_sums_entities"

    job_config = bigquery.LoadJobConfig(
        schema = sums_schema,
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition="WRITE_TRUNCATE"
    )

    load_job = client.load_table_from_json(
        data, table_id, job_config=job_config
    )

    load_job.result()

    # Parse the JSON response from The Graph API for TS
    data = response_optimism.json()["data"]["blsWalletStatsTSEntities"]

    table_id = "blocktrekker.the_graph_data.bls_wallet_optimism_goerli_stats_ts_entities"

    job_config = bigquery.LoadJobConfig(
        schema = ts_schema,
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition="WRITE_TRUNCATE"
    )

    load_job = client.load_table_from_json(
        data, table_id, job_config=job_config
    )

    load_job.result()

    response_arbitrum = requests.post(
        "https://api.thegraph.com/subgraphs/name/outsider-analytics/bls-wallet",
        headers=headers,
        json={"query": query},
    )
    
    # Parse the JSON response from The Graph API
    data = response_arbitrum.json()["data"]["blsWalletStatsSumsEntities"]

    table_id = "blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_sums_entities"

    job_config = bigquery.LoadJobConfig(
        schema = sums_schema,
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition="WRITE_TRUNCATE"
    )

    load_job = client.load_table_from_json(
        data, table_id, job_config=job_config
    )

    load_job.result()

    # Parse the JSON response from The Graph API for TS
    data = response_arbitrum.json()["data"]["blsWalletStatsTSEntities"]

    table_id = "blocktrekker.the_graph_data.bls_wallet_arbitrum_goerli_stats_ts_entities"

    job_config = bigquery.LoadJobConfig(
        schema = ts_schema,
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition="WRITE_TRUNCATE"
    )

    load_job = client.load_table_from_json(
        data, table_id, job_config=job_config
    )

    load_job.result()

    return "done"