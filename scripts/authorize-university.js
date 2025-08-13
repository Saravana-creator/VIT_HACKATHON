const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const universityToAuthorize = "0x4D12FC860305A671DC28D4F76CBA437473d3981a"; // Your MetaMask account
  
  const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
  const contract = CredentialNFT.attach(contractAddress);

  console.log("Authorizing university:", universityToAuthorize);
  
  const tx = await contract.authorizeUniversity(universityToAuthorize);
  await tx.wait();
  
  console.log("University authorized successfully!");
  console.log("Transaction hash:", tx.hash);
  
  // Verify authorization
  const isAuthorized = await contract.authorizedUniversities(universityToAuthorize);
  console.log("Authorization status:", isAuthorized);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });