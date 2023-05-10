import requests
from google.cloud import bigquery
import os

# This pulls in data from the graph into BigQuery.
# It is run every hour by a cron job on the GCP, but can also be run locally. 



credential_path = "../keys/blocktrekker-admin.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path

# Set up the Google BigQuery client
client = bigquery.Client()

# Set up the query to run against The Graph API
query = """
{
  blsWalletStatsSumsEntities (first: 1) {
    id
    numWalletsCreated
    numBundlesSubmitted
    numOperationsSubmitted
    numOperationsSubmitted
    numActionsSubmitted
    numWalletsRecovered
    actionMethodIds
    avgActionsPerBundle
    avgOperationsPerBundle
    avgActionsPerOperation
  }
  blsWalletStatsTSEntities (first:1000) {
    id
    numWalletsCreated
    numBundlesSubmitted
    numOperationsSubmitted
    numOperationsSubmitted
    numActionsSubmitted
    numWalletsRecovered
    actionMethodIds
    avgActionsPerBundle
    avgOperationsPerBundle
    avgActionsPerOperation
  }
}
"""

# Set up the headers for the API request
headers = {
    "Content-Type": "application/json",
}

# Set up the request to The Graph API
response = requests.post(
    "https://api.thegraph.com/subgraphs/name/outsider-analytics/bls-wallet",
    headers=headers,
    json={"query": query},
)

# Parse the JSON response from The Graph API
data = response.json()["data"]["blsWalletStatsSumsEntities"]
print(data)



# Set up the BigQuery table and load the data
table_id = "blocktrekker.the_graph_data.bls_wallet_stats_sums_entities"

job_config = bigquery.LoadJobConfig(
    autodetect=True,
    source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
    write_disposition="WRITE_TRUNCATE"
)

load_job = client.load_table_from_json(
    data, table_id, job_config=job_config
)

load_job.result()

print(f'Loaded {len(data)} rows into {table_id}')

# Parse the JSON response from The Graph API
data = response.json()["data"]["blsWalletStatsTSEntities"]
print(data)



table_id = "blocktrekker.the_graph_data.bls_wallet_stats_ts_entities"

job_config = bigquery.LoadJobConfig(
    autodetect=True,
    source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
    write_disposition="WRITE_TRUNCATE"
)

load_job = client.load_table_from_json(
    data, table_id, job_config=job_config
)

load_job.result()

print(f'Loaded {len(data)} rows into {table_id}')