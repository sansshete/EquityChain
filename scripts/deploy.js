const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Equity Crowdfunding DApp contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy CrowdfundingFactory
  console.log("\nDeploying CrowdfundingFactory...");
  const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
  const crowdfundingFactory = await CrowdfundingFactory.deploy();
  
  await crowdfundingFactory.waitForDeployment();
  const factoryAddress = await crowdfundingFactory.getAddress();
  
  console.log("CrowdfundingFactory deployed to:", factoryAddress);

  // Verify deployment
  const platformFee = await crowdfundingFactory.platformFeePercentage();
  console.log("Platform fee:", platformFee.toString(), "basis points (", (Number(platformFee) / 100).toString(), "%)");

  console.log("\nDeployment completed!");
  console.log("Update CONTRACT_ADDRESSES in src/contracts/contractAddresses.ts with:");
  console.log(`crowdfundingFactory: '${factoryAddress}',`);

  // Create a sample project for testing (optional)
  console.log("\nCreating sample project for testing...");
  try {
    const sampleTx = await crowdfundingFactory.createProject(
      "Sample DeFi Project",
      "A revolutionary DeFi protocol for yield farming",
      ethers.parseEther("10"), // 10 ETH funding goal
      ["MVP Development", "Beta Testing", "Mainnet Launch"], // Milestone descriptions
      [ethers.parseEther("4"), ethers.parseEther("3"), ethers.parseEther("3")], // Milestone amounts
      "SampleToken",
      "SMPL",
      ethers.parseEther("1000"), // 1000 tokens total supply
      30 * 24 * 60 * 60 // 30 days funding duration
    );
    
    const receipt = await sampleTx.wait();
    console.log("Sample project created! Transaction:", receipt.hash);
    
    // Get the project address from events
    const event = receipt.logs.find(log => {
      try {
        const parsed = crowdfundingFactory.interface.parseLog(log);
        return parsed?.name === 'ProjectCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = crowdfundingFactory.interface.parseLog(event);
      console.log("Sample project contract address:", parsed?.args[0]);
    }
  } catch (error) {
    console.log("Note: Sample project creation failed (this is optional):", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });