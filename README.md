# bls-wallet-analytics
Analytics dashboard for BLS Wallet
# BLS Wallet Analytics Grant

* **Project:** BLS Wallet Analytics

## Project Overview :page_facing_up: 

### Overview
The idea for this grant is to solve issue 288 from BLS Wallet project (see link below).  The problem for BLS Wallet is the lack of visibility into usage of the product. Some of the metrics desired include:
1. Number of wallets
2. Number of wallet recoveries
3. Number of bundles submitted
4. Number of operations submitted
5. Number of operations per bundle
6. Number of actions per operation
7. Number of failed actions/operations
8. Types of actions (transfer, mint, approval, etc.)
9. Contract addresses interacted with
10. Min, max, and avg operation gas cost
11. Gas saved from bundling transactions

(Exact metrics to be finalized in Milestone 1)

The main deployment of the project is on Arbitrum Test Net which makes on chain data solutions challenging. Broad strokes is that our Eth-Denver hackathon is the perfect way to create a robust solution to the data challenge.

While Arbitrum Goerli test net is the current implementation chain, a goal of this project will be to make the code base easily reusable for other chains. This is a standard way of building within BlockTrekker and will be emphasized for this project. 

### Project Details 
Original issue & discussion: https://github.com/web3well/bls-wallet/issues/288

After the Eth Denver hackathon and discussions we decided to make this project based on the hackathon project "BlockTrekker". BlockTrekker is an open source project which utilizes a Big Query backend to give data scientists more power and flexibility to surface on-chain data. Users have the ability to 
1. query different chains with simple SQL code
2. create charts and dashboards publically or internally
3. export query data as a CSV or Json
4. utilize APIs to query or export data

The project is split into 2 milestones of 2-3 weeks each 
* **Set up and Research**
    * We want to take our time and ensure we are creating the product that will best meet BLS Wallet's needs
    * We are relatively confident in the viability and direction of our solution, but will confirm the exact plan of attack here
* **Build the Query Data and Dashboard**
    * We will ensure this is built with future chains in mind (Main net, Optimism, etc.)
    * Event and functon calls will be considered from the different contracts in the BLS Wallet flow
    * The end goal will be to create a public dashboard that is informative, beautiful, flexible, and easily updated 

We would love a check in with the BLS Wallet team once per 2 weeks, and would be happy to do so more frequently as desired. The full project will be built in a public github repo, with async check-ins welcome. 


## Team :busts_in_silhouette:

### Team members
* Names of team members
  * Brian Wilkes
    * Brian@outsideranalytics.xyz
  * Ian Brighton
    * Ian@mach34.space

### Team Website	
* https://github.com/outsider-analytics
### Team's experience
* Brian:
    * COO at Mach34 Web3 Consulting
        * https://www.linkedin.com/company/81878456
    * Owner of Outsider Analytics, an Ethereum based data science company
    * EF Merge Data Challenge Prize Winner (2022)
    * Former EF Grant Recipient: https://github.com/outsider-analytics/ZK-Circuit-Performance-and-Security-Data
    * CFA Charter Holder
* Ian:
    * CTO, Co-founder of Mach 34 Web3 Consulting
        * https://www.linkedin.com/company/81878456
    * Aztec Network Grant Recipient:
        * https://github.com/BattleZips/BattleZips-Noir
    * EF Grant Recipient:
        * https://github.com/BattleZips/BattleZipsV2
    * Placed 6th in the 2022 Eth Denver hackathon
        * https://dorahacks.io/buidl/2079
    
### Team Code Repos
https://github.com/Ian-Bright/bls-wallet-analytics
https://github.com/BlockTrekker

## Development Roadmap :nut_and_bolt: 

### Overview
* **Total Estimated Duration:** 4 weeks
* **Start Date:** 3/6/2023

### Milestone 1: Get repo set up, Research Project, Finalize plan of attack
* **Estimated Duration:** 2 weeks
* **Estimated delivery date**: March 20th 2023

| Number | Deliverable | Specification |
| ------------- | ------------- | ------------- |
| 1. | Project Repo | Get the admin sides of the project launch out of the way | 
| 2. | BLS Wallet Fully Researched | We will review relevant BLS wallet contracts  and ensure a full understanding of the project | 
| 3. | Metrics Chosen | We will finalize all metrics to be collected from BlockTrekker, and ensure the viability of all metrics desired | 
| 4. | Design | A general design and front end package will be chosen and approved by the BLS wallet team| 

### Milestone 2: Build the Queries and Charts
* **Estimated Duration:** 2 weeks
* **Estimated delivery date**: April 3rd 2023

| Number | Deliverable | Specification |
| ------------- | ------------- | ------------- |
| 0a. | Open-Source | We will make all sections of code used open source as a part of the greater effort to make all Blocktrekker code open source as soon as feasibly possible |
| 0b. | Documentation | We will provide inline documentation of the code as being written |
| 1. | SQL Queries Written | Write all SQL queries needed to build the data for the metrics chosen in Milestone 1. Queries will be usable with any data backend which has Arbitrum Goerli with minor tweaks |
| 2. | Data Dashboard Built | We will build a dashboard for the provided metrics chosen in Milestone 1 using Blocktrekker's open source front end |
| 3. | Functionality | Users and BLS Wallet team members will have a link to the front end charts hosted on Blocktrekker's front end. There will be a  | 
| 4. | Unit Testing | We will use the DBT based unit testing to ensure data reliability as per BLS Wallet internal data metrics and assumptions | 
