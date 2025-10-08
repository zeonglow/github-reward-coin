# Kudos Token

## "token" package

### Purpose:

Utilities for creating and performing operations on the "KUDOS" coin


### Getting Started:

- Example `.env` file

```.env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
PRIVATE_KEY=4813ed...
ETHERSCAN_API_KEY=1SUJ...
```

### Simple Instructions

- Setup Etherscan account:
  https://etherscan.io/
- Setup Alchemy account:
  https://www.alchemy.com/rpc/ethereum-sepolia
- Create a MetaMask wallet

#### More detailed instructions

Etherscan and Alchemy are simple enough,  there is no need to pay any money.

#### Metamask
Setting up Metamask is also simple, but you must enable 'test networks' first.

Hamburger icon in top right -> Settings -> "Show Test Networks"
Network drop down menu ( top left of wallet ) -> select "Sepolia" ( under "testnets")

### CodeKudosToken
 - Sepolia Network (testnet) https://sepolia.etherscan.io/address/0xfaB0FCc1C301B187973eDEed298104e323fb3bfb
 - Mainnet:  (Not yet deployed)

### Usage

**WARNING**

The following will create *brand new* tokens with exactly the same name and ticker symbol!

- yarn deploy:sepolia
- yarn deploy:mainnet
