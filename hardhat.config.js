require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    ...(process.env.SEPOLIA_RPC_URL && process.env.SEPOLIA_RPC_URL !== "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID" && {
      sepolia: {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== "0x1234567890123456789012345678901234567890123456789012345678901234" ? [process.env.PRIVATE_KEY] : []
      }
    })
  }
};