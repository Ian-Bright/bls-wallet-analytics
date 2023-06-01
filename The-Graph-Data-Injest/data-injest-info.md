# Cron Job Info

### Purpose:
This cron job is used to bring in The Graph data from the subgraph: https://thegraph.com/hosted-service/subgraph/outsider-analytics/bls-wallet by calling the BLS-WalletInjest.py


### How it works
For simpicity, as more self service functionality is built out, we are using google's Cloud Funcions and Scheduler to get the python script to run hourly and load the data into our Blocktrekker Database.
The python file "BLS-Wallet-Injest.py" is the python script which makes an api call to the subgraph and loads it into the big query database.
The cloud scheduler has the following information:
* Runs every hour: 0 * * * * 
* Runs in MDT

### Replication
The python script can be used to add data in any arbitrary big query database with a change of acount info, or locally/other cloud dbs as per its load systems.