import { ethers } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  console.log("Deploying DIDRegistry contract...");

  // Get the DIDRegistry contract factory
  const DIDRegistryFactory = await ethers.getContractFactory("DIDRegistry");
  
  // Deploy the contract
  const didRegistry = await DIDRegistryFactory.deploy();
  
  // Wait for the contract to be deployed
  await didRegistry.waitForDeployment();
  
  // Get the contract address
  const didRegistryAddress = await didRegistry.getAddress();
  console.log(`DIDRegistry deployed to: ${didRegistryAddress}`);

  // Verify contract on Etherscan if not on a local network
  const networkName = process.env.HARDHAT_NETWORK || "localhost";
  
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("Waiting for block confirmations...");
    
    // Wait for 6 block confirmations
    await didRegistry.deploymentTransaction()?.wait(6);
    
    // Verify the contract on Etherscan
    await verify(didRegistryAddress, []);
    console.log("Contract verified on Etherscan");
  }
}

// Execute the deployment function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 