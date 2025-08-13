const { ethers } = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();
  
  if (signers.length === 0) {
    throw new Error("No signers available. Check your PRIVATE_KEY in .env file.");
  }
  
  const deployer = signers[0];
  console.log("Deploying contracts with account:", deployer.address);

  const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
  const credentialNFT = await CredentialNFT.deploy();
  await credentialNFT.waitForDeployment();

  console.log("CredentialNFT deployed to:", await credentialNFT.getAddress());
  
  // Authorize the deployer as a university for testing
  await credentialNFT.authorizeUniversity(deployer.address);
  console.log("Deployer authorized as university");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });