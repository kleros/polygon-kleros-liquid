require('dotenv/config')
const HDWalletProvider = require('truffle-hdwallet-provider-privkey')

const PRIVATE_KEYS = JSON.parse(process.env.PRIVATE_KEYS)

module.exports = {
  compilers: {
    solc: {
      version: '0.4.26',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1,
        },
      },
    },
  },
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 8000000,
    },
    matic: {
      provider: function () {
        return new HDWalletProvider(
          [PRIVATE_KEYS['matic']],
          'https://rpc-mainnet.matic.network'
        )
      },
      network_id: 137,
      gas: 10000000,
      gasPrice: 1000000000,
    },
    mumbai: {
      provider: function () {
        return new HDWalletProvider(
          [PRIVATE_KEYS['mumbai']],
          'https://rpc-mumbai.matic.today'
        )
      },
      network_id: '80001',
      gas: 10000000,
      gasPrice: 1000000000,
    },
  },
  plugins: [
    // "truffle-contract-size",
    'truffle-plugin-verify',
  ],
}
