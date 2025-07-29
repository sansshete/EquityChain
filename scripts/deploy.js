const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy ProjectFactory
  const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
  const projectFactory = await ProjectFactory.deploy(deployer.address); // Fee recipient
  
  await projectFactory.waitForDeployment();
  const factoryAddress = await projectFactory.getAddress();
  
  console.log("ProjectFactory deployed to:", factoryAddress);
  console.log("Fee recipient set to:", deployer.address);

  // Verify deployment
  const platformFee = await projectFactory.platformFeePercentage();
  console.log("Platform fee:", platformFee.toString(), "basis points (", (Number(platformFee) / 100).toString(), "%)");

  console.log("\nDeployment completed!");
  console.log("Update CONTRACT_ADDRESSES in src/contracts/contractAddresses.ts with:");
  console.log(`projectFactory: '${factoryAddress}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });